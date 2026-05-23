import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/AssistantPage.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=cc136696"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import useAuthUser from "/src/hooks/useAuthUser.js";
import ChatAIAssistant from "/src/components/ChatAIAssistant.jsx";
const AssistantPage = () => {
  _s();
  const { authUser } = useAuthUser();
  return /* @__PURE__ */ jsxDEV("div", { className: "p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ jsxDEV("div", { className: "container mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border border-base-300 bg-base-100/80 p-4", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold", children: "AI Chat Assistant" }, void 0, false, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
        lineNumber: 30,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm opacity-70 mt-1", children: "Translate, improve grammar, generate conversation starters, and practice pronunciation." }, void 0, false, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
        lineNumber: 31,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
      lineNumber: 29,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(ChatAIAssistant, { authUser }, void 0, false, {
      fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
      lineNumber: 36,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
    lineNumber: 28,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
};
_s(AssistantPage, "Gvy3Qc1ZJXbn+TyQPT8vUVGSLd4=", false, function() {
  return [useAuthUser];
});
_c = AssistantPage;
export default AssistantPage;
var _c;
$RefreshReg$(_c, "AssistantPage");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/AssistantPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBVVU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVlYsT0FBT0EsaUJBQWlCO0FBQ3hCLE9BQU9DLHFCQUFxQjtBQUU1QixNQUFNQyxnQkFBZ0JBLE1BQU07QUFBQUMsS0FBQTtBQUMxQixRQUFNLEVBQUVDLFNBQVMsSUFBSUosWUFBWTtBQUVqQyxTQUNFLHVCQUFDLFNBQUksV0FBVSxxQkFDYixpQ0FBQyxTQUFJLFdBQVUsK0JBQ2I7QUFBQSwyQkFBQyxTQUFJLFdBQVUsd0RBQ2I7QUFBQSw2QkFBQyxRQUFHLFdBQVUsc0JBQXFCLGlDQUFuQztBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQW9EO0FBQUEsTUFDcEQsdUJBQUMsT0FBRSxXQUFVLDJCQUEwQix1R0FBdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUVBO0FBQUEsU0FKRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBS0E7QUFBQSxJQUVBLHVCQUFDLG1CQUFnQixZQUFqQjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQW9DO0FBQUEsT0FSdEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQVNBLEtBVkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQVdBO0FBRUo7QUFBRUcsR0FqQklELGVBQWE7QUFBQSxVQUNJRixXQUFXO0FBQUE7QUFBQSxLQUQ1QkU7QUFtQk4sZUFBZUE7QUFBYyxJQUFBRztBQUFBLGFBQUFBLElBQUEiLCJuYW1lcyI6WyJ1c2VBdXRoVXNlciIsIkNoYXRBSUFzc2lzdGFudCIsIkFzc2lzdGFudFBhZ2UiLCJfcyIsImF1dGhVc2VyIiwiX2MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQXNzaXN0YW50UGFnZS5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVzZUF1dGhVc2VyIGZyb20gXCIuLi9ob29rcy91c2VBdXRoVXNlclwiO1xyXG5pbXBvcnQgQ2hhdEFJQXNzaXN0YW50IGZyb20gXCIuLi9jb21wb25lbnRzL0NoYXRBSUFzc2lzdGFudFwiO1xyXG5cclxuY29uc3QgQXNzaXN0YW50UGFnZSA9ICgpID0+IHtcclxuICBjb25zdCB7IGF1dGhVc2VyIH0gPSB1c2VBdXRoVXNlcigpO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBjbGFzc05hbWU9XCJwLTQgc206cC02IGxnOnAtOFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lciBteC1hdXRvIHNwYWNlLXktNFwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJhc2UtMzAwIGJnLWJhc2UtMTAwLzgwIHAtNFwiPlxyXG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZFwiPkFJIENoYXQgQXNzaXN0YW50PC9oMj5cclxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gb3BhY2l0eS03MCBtdC0xXCI+XHJcbiAgICAgICAgICAgIFRyYW5zbGF0ZSwgaW1wcm92ZSBncmFtbWFyLCBnZW5lcmF0ZSBjb252ZXJzYXRpb24gc3RhcnRlcnMsIGFuZCBwcmFjdGljZSBwcm9udW5jaWF0aW9uLlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8Q2hhdEFJQXNzaXN0YW50IGF1dGhVc2VyPXthdXRoVXNlcn0gLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXNzaXN0YW50UGFnZTtcclxuIl0sImZpbGUiOiJDOi9Vc2Vycy9ZYXNoL0Rlc2t0b3AvVm94b3JhL2Zyb250ZW5kL3NyYy9wYWdlcy9Bc3Npc3RhbnRQYWdlLmpzeCJ9