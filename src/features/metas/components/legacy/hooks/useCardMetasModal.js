import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useCardMetasModal(meta, onClose) {
  const [closing, setClosing] = useState(false);
  const contentRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const closeTimeoutRef = useRef(null);
  const originalOverflowRef = useRef(null);

  useEffect(() => {
    originalOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const calculateScroll = () => {
      if (!contentRef.current) return;
      setNeedsScroll(contentRef.current.scrollHeight > window.innerHeight);
    };

    calculateScroll();
    window.addEventListener("resize", calculateScroll);

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      document.body.style.overflow = originalOverflowRef.current ?? "";

      window.removeEventListener("resize", calculateScroll);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (closeTimeoutRef.current) return;

    setClosing(true);

    closeTimeoutRef.current = setTimeout(() => {
      onClose?.();
      closeTimeoutRef.current = null;
    }, 400);
  }, [onClose]);

  const parsedTitle = useMemo(() => {
    const titleParts = meta?.listing?.titleParts;
    if (titleParts) return titleParts;
    const tituloHtml = meta?.listing?.titulo || "";
    const regex = /<strong>(.*?)<\/strong>([,.]?)(.*)/;
    const match = tituloHtml.match(regex);

    if (match) {
      return {
        strongText: (match[1] + match[2]).trim(),
        normalText: match[3].trim(),
      };
    }

    return {
      strongText: tituloHtml,
      normalText: "",
    };
  }, [meta]);

  const hexToRgba = useCallback((hex, alpha) => {
    if (!hex) return "";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  return {
    closing,
    contentRef,
    needsScroll,
    handleClose,
    hexToRgba,
    parsedTitle,
  };
}