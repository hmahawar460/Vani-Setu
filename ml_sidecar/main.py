"""
WisperFlow ML Sidecar — FastAPI service hosting Python NLP models.

Models are loaded ONCE at startup via FastAPI lifespan events.
Every endpoint returns HTTP 200 even on model errors (graceful fallback = input unchanged).
Input is truncated to 2000 characters before passing to any model.
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import List, Optional, Tuple

from fastapi import FastAPI
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="[%(name)s] %(levelname)s %(message)s")
logger = logging.getLogger("ml-sidecar")

MAX_INPUT_LEN = 2000  # characters — truncation guard for all model endpoints

# ─────────────────────────────────────────────────────────────────────────────
# Model containers — populated during lifespan startup
# ─────────────────────────────────────────────────────────────────────────────
models: dict = {
    "spello": None,
    "grammar_hindi_tokenizer": None,
    "grammar_hindi_model": None,
    "grammar_english_tokenizer": None,
    "grammar_english_model": None,
    "wsd": None,
}

loaded_model_names: list[str] = []


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan — load all models at startup
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML models once at startup; release on shutdown."""

    # ── Spello spell corrector ────────────────────────────────────────────
    try:
        t0 = time.time()
        from spello.model import SpellCorrectionModel  # type: ignore

        sp = SpellCorrectionModel(language="hi")
        # Spello uses pre-trained model files; attempt to load from default path.
        # If no model file exists, we skip loading — sidecar still starts.
        try:
            sp.load()
            models["spello"] = sp
            loaded_model_names.append("spello")
            logger.info("Spello loaded in %.2fs", time.time() - t0)
        except Exception as load_err:
            logger.warning("Spello model file not found, spell-correct will echo input: %s", load_err)
    except Exception as e:
        logger.warning("Spello import failed, /spell-correct will echo input: %s", e)

    # ── GEC-mT5-Small-Hindi ───────────────────────────────────────────────
    try:
        t0 = time.time()
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM  # type: ignore

        hindi_model_id = "manavdhamecha77/GEC-mT5-Small-Hindi"
        tok = AutoTokenizer.from_pretrained(hindi_model_id)
        mdl = AutoModelForSeq2SeqLM.from_pretrained(hindi_model_id)
        models["grammar_hindi_tokenizer"] = tok
        models["grammar_hindi_model"] = mdl
        loaded_model_names.append("gec-mt5-small-hindi")
        logger.info("GEC-mT5-Small-Hindi loaded in %.2fs", time.time() - t0)
    except Exception as e:
        logger.warning("GEC-mT5-Small-Hindi failed to load, /grammar-hindi will echo input: %s", e)

    # ── GrammarCorrectionTransformer (English — grammarly/coedit-large) ───
    try:
        t0 = time.time()
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM  # type: ignore

        english_model_id = "grammarly/coedit-large"
        tok_en = AutoTokenizer.from_pretrained(english_model_id)
        mdl_en = AutoModelForSeq2SeqLM.from_pretrained(english_model_id)
        models["grammar_english_tokenizer"] = tok_en
        models["grammar_english_model"] = mdl_en
        loaded_model_names.append("coedit-large-english")
        logger.info("GrammarCorrectionTransformer (coedit-large) loaded in %.2fs", time.time() - t0)
    except Exception as e:
        logger.warning(
            "GrammarCorrectionTransformer failed to load, /grammar-english will echo input: %s", e
        )

    # ── hindiwsd ──────────────────────────────────────────────────────────
    try:
        t0 = time.time()
        from hindiwsd import HindiWSD  # type: ignore

        wsd = HindiWSD()
        models["wsd"] = wsd
        loaded_model_names.append("hindiwsd")
        logger.info("hindiwsd loaded in %.2fs", time.time() - t0)
    except Exception as e:
        logger.warning(
            "hindiwsd import/init failed, /hinglish-pipeline will return fallback: %s", e
        )

    logger.info("Sidecar startup complete. Loaded: %s", loaded_model_names)
    yield
    # ── Cleanup on shutdown ───────────────────────────────────────────────
    logger.info("Sidecar shutting down.")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="WisperFlow ML Sidecar", version="1.0.0", lifespan=lifespan)


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic request / response models
# ─────────────────────────────────────────────────────────────────────────────
class SpellCorrectIn(BaseModel):
    text: str
    lang: Optional[str] = None  # 'hindi' | 'hinglish' | 'english'


class SpellCorrectOut(BaseModel):
    corrected: str
    changed: bool


class GrammarIn(BaseModel):
    text: str


class GrammarOut(BaseModel):
    corrected: str


class HinglishPipelineIn(BaseModel):
    text: str


class HinglishPipelineOut(BaseModel):
    spell_corrected: str
    devanagari: str
    pos: List[Tuple[str, str]]
    wsd: List[Tuple[str, str]]
    confidence: float


# ─────────────────────────────────────────────────────────────────────────────
# Helper — safe truncation
# ─────────────────────────────────────────────────────────────────────────────
def truncate(text: str) -> str:
    """Truncate input to MAX_INPUT_LEN characters before passing to any model."""
    if len(text) > MAX_INPUT_LEN:
        logger.info("Input truncated from %d to %d chars", len(text), MAX_INPUT_LEN)
        return text[:MAX_INPUT_LEN]
    return text


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check — returns loaded model list."""
    return {"ok": True, "models": loaded_model_names}


@app.post("/spell-correct", response_model=SpellCorrectOut)
def spell_correct(req: SpellCorrectIn) -> SpellCorrectOut:
    """
    Spello spell correction.
    Task 1.1 + 1.5: accept {text, lang?}, truncate to 2000 chars, run Spello,
    return {corrected, changed}. On exception return input unchanged with HTTP 200.
    """
    safe_text = truncate(req.text)

    spello = models.get("spello")
    if spello is None:
        # Model not loaded — graceful fallback
        return SpellCorrectOut(corrected=safe_text, changed=False)

    try:
        result = spello.spell_correct(safe_text)
        # Spello may return a dict or a string depending on version
        if isinstance(result, dict):
            corrected = result.get("spell_corrected_text", safe_text)
        elif isinstance(result, str):
            corrected = result
        else:
            corrected = safe_text

        changed = corrected != safe_text
        return SpellCorrectOut(corrected=corrected, changed=changed)
    except Exception as e:
        logger.error("/spell-correct inference error: %s", e)
        return SpellCorrectOut(corrected=safe_text, changed=False)


@app.post("/grammar-hindi", response_model=GrammarOut)
def grammar_hindi(req: GrammarIn) -> GrammarOut:
    """
    GEC-mT5-Small-Hindi grammar correction.
    Task 1.2 + 1.5: truncate to 2000 chars, run inference, return {corrected}.
    On exception return input unchanged.
    """
    safe_text = truncate(req.text)

    tokenizer = models.get("grammar_hindi_tokenizer")
    model = models.get("grammar_hindi_model")

    if tokenizer is None or model is None:
        return GrammarOut(corrected=safe_text)

    try:
        inputs = tokenizer(safe_text, return_tensors="pt", truncation=True, max_length=512)
        outputs = model.generate(**inputs, max_new_tokens=512)
        corrected = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return GrammarOut(corrected=corrected)
    except Exception as e:
        logger.error("/grammar-hindi inference error: %s", e)
        return GrammarOut(corrected=safe_text)


@app.post("/grammar-english", response_model=GrammarOut)
def grammar_english(req: GrammarIn) -> GrammarOut:
    """
    GrammarCorrectionTransformer (grammarly/coedit-large) grammar correction.
    Task 1.3 + 1.5: truncate to 2000 chars, run inference, return {corrected}.
    On exception return input unchanged.
    """
    safe_text = truncate(req.text)

    tokenizer = models.get("grammar_english_tokenizer")
    model = models.get("grammar_english_model")

    if tokenizer is None or model is None:
        return GrammarOut(corrected=safe_text)

    try:
        # coedit-large expects a task prefix
        input_text = f"Fix the grammar: {safe_text}"
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
        outputs = model.generate(**inputs, max_new_tokens=512)
        corrected = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return GrammarOut(corrected=corrected)
    except Exception as e:
        logger.error("/grammar-english inference error: %s", e)
        return GrammarOut(corrected=safe_text)


@app.post("/hinglish-pipeline", response_model=HinglishPipelineOut)
def hinglish_pipeline(req: HinglishPipelineIn) -> HinglishPipelineOut:
    """
    Full Hinglish pipeline: Spello spell correction → hindiwsd transliteration
    → POS tagging → WSD.
    Task 1.4 + 1.5: truncate to 2000 chars, chain stages, return full result.
    On any exception return input text with confidence: 0.0.
    """
    safe_text = truncate(req.text)

    # Fallback response
    fallback = HinglishPipelineOut(
        spell_corrected=safe_text,
        devanagari=safe_text,
        pos=[],
        wsd=[],
        confidence=0.0,
    )

    try:
        # ── Stage 1: Spello spell correction ──────────────────────────────
        spell_corrected = safe_text
        spello = models.get("spello")
        if spello is not None:
            try:
                result = spello.spell_correct(safe_text)
                if isinstance(result, dict):
                    spell_corrected = result.get("spell_corrected_text", safe_text)
                elif isinstance(result, str):
                    spell_corrected = result
            except Exception as sp_err:
                logger.warning("Spello stage in /hinglish-pipeline failed: %s", sp_err)

        # ── Stages 2–4: hindiwsd transliteration, POS, WSD ────────────────
        wsd_model = models.get("wsd")
        if wsd_model is None:
            # hindiwsd not loaded — return spell-corrected text only
            return HinglishPipelineOut(
                spell_corrected=spell_corrected,
                devanagari=spell_corrected,
                pos=[],
                wsd=[],
                confidence=0.0,
            )

        # Stage 2: Transliteration
        devanagari = spell_corrected
        try:
            if hasattr(wsd_model, "transliterate"):
                devanagari = wsd_model.transliterate(spell_corrected)
            elif hasattr(wsd_model, "translit"):
                devanagari = wsd_model.translit(spell_corrected)
            # If neither method exists, keep spell_corrected as devanagari
        except Exception as e:
            logger.warning("hindiwsd transliterate failed: %s", e)

        # Stage 3: POS tagging
        pos_tags: List[Tuple[str, str]] = []
        try:
            if hasattr(wsd_model, "pos_tag"):
                raw_pos = wsd_model.pos_tag(devanagari)
                # Normalize to list of (word, tag) tuples
                if isinstance(raw_pos, list):
                    pos_tags = [
                        (str(item[0]), str(item[1])) if isinstance(item, (list, tuple)) and len(item) >= 2
                        else (str(item), "NN")
                        for item in raw_pos
                    ]
        except Exception as e:
            logger.warning("hindiwsd pos_tag failed: %s", e)

        # Stage 4: WSD
        wsd_tags: List[Tuple[str, str]] = []
        try:
            if hasattr(wsd_model, "wsd"):
                raw_wsd = wsd_model.wsd(devanagari)
                if isinstance(raw_wsd, list):
                    wsd_tags = [
                        (str(item[0]), str(item[1])) if isinstance(item, (list, tuple)) and len(item) >= 2
                        else (str(item), "")
                        for item in raw_wsd
                    ]
        except Exception as e:
            logger.warning("hindiwsd wsd failed: %s", e)

        # Compute simple confidence from how many tokens got WSD tags
        if pos_tags:
            tagged_ratio = len(wsd_tags) / len(pos_tags)
            confidence = round(min(max(tagged_ratio, 0.0), 1.0), 4)
        else:
            confidence = 0.5 if devanagari != spell_corrected else 0.0

        return HinglishPipelineOut(
            spell_corrected=spell_corrected,
            devanagari=devanagari,
            pos=pos_tags,
            wsd=wsd_tags,
            confidence=confidence,
        )

    except Exception as e:
        logger.error("/hinglish-pipeline error: %s", e)
        return fallback
