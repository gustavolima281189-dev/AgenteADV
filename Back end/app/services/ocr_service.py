from __future__ import annotations

import cv2
import numpy as np
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image


_TESSERACT_CONFIG = "--psm 6 --oem 3"


def pdf_to_text(pdf_bytes: bytes) -> str:
    images = convert_from_bytes(pdf_bytes, dpi=300, fmt="png")
    pages = [_extract_page_text(img) for img in images]
    return "\n\n".join(p for p in pages if p.strip())


def _extract_page_text(pil_image: Image.Image) -> str:
    processed = _preprocess(pil_image)
    return pytesseract.image_to_string(processed, lang="por", config=_TESSERACT_CONFIG)


def _preprocess(pil_image: Image.Image) -> Image.Image:
    arr = np.array(pil_image.convert("RGB"))
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)

    denoised = cv2.fastNlMeansDenoising(gray, h=10)

    _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

    return Image.fromarray(cleaned)
