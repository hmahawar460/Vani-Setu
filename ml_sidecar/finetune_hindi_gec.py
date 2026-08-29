"""
Fine-tune manavdhamecha77/GEC-mT5-Small-Hindi on custom Hindi GEC data.

Usage:
    1. Prepare a CSV file with two columns: 'incorrect' and 'correct'
       Example row: "मैने खाना खाया","मैंने खाना खाया"

    2. Install dependencies:
       pip install -r requirements.txt datasets pandas accelerate

    3. Run training:
       python finetune_hindi_gec.py --csv data/train.csv --epochs 5 --batch_size 8

    4. After training, the fine-tuned model is saved to ./finetuned-gec-mt5-hindi/
       Update main.py to load from that local path instead of the HuggingFace ID.

Dataset sources:
    - IndiGEC Corpus: https://github.com/ujjwalsharmaIITB/IndiGEC
    - Synthetic data via MTF framework (included in IndiGEC repo)
"""

from __future__ import annotations

import argparse
import os
import logging

import pandas as pd
import torch
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq,
)

logging.basicConfig(level=logging.INFO, format="[%(name)s] %(levelname)s %(message)s")
logger = logging.getLogger("finetune-gec")

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────
BASE_MODEL_ID = "manavdhamecha77/GEC-mT5-Small-Hindi"
OUTPUT_DIR = "./finetuned-gec-mt5-hindi"
MAX_INPUT_LEN = 256
MAX_TARGET_LEN = 256


def load_csv_dataset(csv_path: str) -> Dataset:
    """
    Load a CSV with columns 'incorrect' and 'correct'.
    Returns a HuggingFace Dataset.
    """
    df = pd.read_csv(csv_path)

    # Validate required columns
    if "incorrect" not in df.columns or "correct" not in df.columns:
        raise ValueError(
            f"CSV must have 'incorrect' and 'correct' columns. "
            f"Found: {list(df.columns)}"
        )

    # Drop rows with missing values
    df = df.dropna(subset=["incorrect", "correct"])
    logger.info("Loaded %d sentence pairs from %s", len(df), csv_path)

    return Dataset.from_pandas(df[["incorrect", "correct"]].reset_index(drop=True))


def tokenize_fn(examples, tokenizer):
    """Tokenize incorrect (input) and correct (target) sentences."""
    model_inputs = tokenizer(
        examples["incorrect"],
        max_length=MAX_INPUT_LEN,
        truncation=True,
        padding="max_length",
    )

    labels = tokenizer(
        text_target=examples["correct"],
        max_length=MAX_TARGET_LEN,
        truncation=True,
        padding="max_length",
    )

    # Replace pad token ids with -100 so they are ignored during loss computation
    labels["input_ids"] = [
        [(tok if tok != tokenizer.pad_token_id else -100) for tok in label]
        for label in labels["input_ids"]
    ]

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


def main():
    parser = argparse.ArgumentParser(
        description="Fine-tune GEC-mT5-Small-Hindi on custom Hindi GEC data"
    )
    parser.add_argument(
        "--csv",
        type=str,
        required=True,
        help="Path to CSV file with 'incorrect' and 'correct' columns",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=5,
        help="Number of training epochs (default: 5)",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=8,
        help="Training batch size (default: 8)",
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=3e-4,
        help="Learning rate (default: 3e-4)",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=OUTPUT_DIR,
        help=f"Output directory for fine-tuned model (default: {OUTPUT_DIR})",
    )
    parser.add_argument(
        "--eval_split",
        type=float,
        default=0.1,
        help="Fraction of data to use for evaluation (default: 0.1)",
    )

    args = parser.parse_args()

    # ── Step 1: Load model & tokenizer ────────────────────────────────────
    logger.info("Loading base model: %s", BASE_MODEL_ID)
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID)
    model = AutoModelForSeq2SeqLM.from_pretrained(BASE_MODEL_ID)
    logger.info("Model loaded successfully")

    # ── Step 2: Load & prepare data ───────────────────────────────────────
    dataset = load_csv_dataset(args.csv)

    # Train/eval split
    if args.eval_split > 0 and len(dataset) > 10:
        split = dataset.train_test_split(test_size=args.eval_split, seed=42)
        train_dataset = split["train"]
        eval_dataset = split["test"]
        logger.info(
            "Split: %d train, %d eval", len(train_dataset), len(eval_dataset)
        )
    else:
        train_dataset = dataset
        eval_dataset = None
        logger.info("Using all %d samples for training (no eval split)", len(dataset))

    # ── Step 3: Tokenize ──────────────────────────────────────────────────
    logger.info("Tokenizing dataset...")
    train_dataset = train_dataset.map(
        lambda ex: tokenize_fn(ex, tokenizer),
        batched=True,
        remove_columns=["incorrect", "correct"],
    )
    if eval_dataset is not None:
        eval_dataset = eval_dataset.map(
            lambda ex: tokenize_fn(ex, tokenizer),
            batched=True,
            remove_columns=["incorrect", "correct"],
        )

    # ── Step 4: Training configuration ────────────────────────────────────
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        padding=True,
    )

    training_args = Seq2SeqTrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        learning_rate=args.lr,
        weight_decay=0.01,
        warmup_steps=100,
        logging_steps=50,
        save_strategy="epoch",
        eval_strategy="epoch" if eval_dataset is not None else "no",
        save_total_limit=2,
        predict_with_generate=True,
        generation_max_length=MAX_TARGET_LEN,
        fp16=torch.cuda.is_available(),
        report_to="none",
        load_best_model_at_end=eval_dataset is not None,
    )

    # ── Step 5: Train ─────────────────────────────────────────────────────
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    logger.info("Starting training for %d epochs...", args.epochs)
    trainer.train()

    # ── Step 6: Save ──────────────────────────────────────────────────────
    logger.info("Saving fine-tuned model to %s", args.output_dir)
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    logger.info(
        "✅ Fine-tuning complete!\n"
        "   To use the fine-tuned model, update main.py line:\n"
        '     hindi_model_id = "%s"\n'
        "   to:\n"
        '     hindi_model_id = "%s"',
        BASE_MODEL_ID,
        os.path.abspath(args.output_dir),
    )


if __name__ == "__main__":
    main()
