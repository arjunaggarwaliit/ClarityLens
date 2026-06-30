
(function () {
  "use strict";

  const CFG = CLARITYLENS_CONFIG;
  const _interactions = [];

  // CREATE DISCLOSURE WRAPPER
  function wrapElement(el, simplifiedText, tldrText, originalText) {
    if (el.closest(".claritylens-disclosure-wrapper")) return null;
    if (el.dataset.claritylensDisclosed) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "claritylens-disclosure-wrapper";
    wrapper.dataset.claritylensInjected = "true";
    wrapper.dataset.claritylensDompath = ClarityLensDOM.getDomPath(el);

    if (tldrText) {
      const tldr = document.createElement("div");
      tldr.className = "claritylens-tldr";
      tldr.dataset.claritylensInjected = "true";

      const tldrLabel = document.createElement("span");
      tldrLabel.className = "claritylens-tldr-label";
      tldrLabel.textContent = CFG.DISCLOSURE.TLDR_LABEL;

      const tldrContent = document.createElement("span");
      tldrContent.className = "claritylens-tldr-content";
      tldrContent.textContent = tldrText;

      tldr.appendChild(tldrLabel);
      tldr.appendChild(tldrContent);
      wrapper.appendChild(tldr);
    }

    const simplified = document.createElement("div");
    simplified.className = "claritylens-simplified";
    simplified.dataset.claritylensInjected = "true";

    const badge = document.createElement("span");
    badge.className = "claritylens-badge";
    badge.textContent = CFG.DISCLOSURE.SHOW_SIMPLIFIED_LABEL;
    badge.dataset.claritylensInjected = "true";

    const simplifiedContent = document.createElement("div");
    simplifiedContent.className = "claritylens-simplified-content";
    simplifiedContent.innerHTML = simplifiedText; // AI may return structured HTML

    simplified.appendChild(badge);
    simplified.appendChild(simplifiedContent);
    wrapper.appendChild(simplified);

    const details = document.createElement("details");
    details.className = "claritylens-original";
    details.dataset.claritylensInjected = "true";

    const summary = document.createElement("summary");
    summary.className = "claritylens-original-toggle";
    summary.textContent = CFG.DISCLOSURE.SHOW_ORIGINAL_LABEL;

    const originalContent = document.createElement("div");
    originalContent.className = "claritylens-original-content";
    originalContent.textContent = originalText || el.textContent;

    details.appendChild(summary);
    details.appendChild(originalContent);
    wrapper.appendChild(details);

    details.addEventListener("toggle", () => {
      _interactions.push({
        domPath: wrapper.dataset.claritylensDompath,
        action: details.open ? "expand-original" : "collapse-original",
        timestamp: Date.now(),
        domain: window.location.hostname
      });
    });

    el.dataset.claritylensDisclosed = "true";
    el.parentNode.insertBefore(wrapper, el);
    el.style.display = "none";
    el.dataset.claritylensOriginalElement = "true";

    return wrapper;
  }

  // WRAP WITH AI RESULT
  function wrapWithAIResult(el, aiResult, profiles) {
    const isADHD = profiles.includes("adhd");

    const simplifiedText = aiResult.simplified || aiResult.text || el.textContent;
    const tldrText = isADHD ? (aiResult.tldr || null) : null;
    const originalText = el.textContent;

    return wrapElement(el, simplifiedText, tldrText, originalText);
  }

  function batchWrap(results, profiles) {
    let wrapped = 0;
    results.forEach(result => {
      if (!result.el || !result.aiResult) return;
      const wrapper = wrapWithAIResult(result.el, result.aiResult, profiles);
      if (wrapper) wrapped++;
    });
    return wrapped;
  }

  // GET INTERACTIONS (for Learning Layer)
  function getInteractions() {
    return [..._interactions];
  }

  function clearInteractions() {
    _interactions.length = 0;
  }

  // Export
  window.ClarityLensDisclosure = {
    wrapElement,
    wrapWithAIResult,
    batchWrap,
    getInteractions,
    clearInteractions
  };
})();
