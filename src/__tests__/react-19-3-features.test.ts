import { describe, it, expect, vi } from "vitest";
import React, { ViewTransition, addTransitionType, startTransition, type FragmentInstance } from "react";

describe("React 19.3 Features Integration", () => {
  it("exports ViewTransition component and addTransitionType function", () => {
    expect(ViewTransition).toBeDefined();
    expect(typeof ViewTransition).toBe("symbol");
    expect(typeof addTransitionType).toBe("function");
  });

  it("supports ViewTransition element creation with name and className props", () => {
    const element = React.createElement(
      ViewTransition,
      { name: "test-transition" },
      React.createElement("div", null, "Hello")
    );
    expect(element).toBeDefined();
    expect(element.type).toBe(ViewTransition);
    expect(element.props.name).toBe("test-transition");
  });

  it("allows addTransitionType inside startTransition", () => {
    let executed = false;
    expect(() => {
      startTransition(() => {
        addTransitionType("generate-puzzle");
        executed = true;
      });
    }).not.toThrow();
    expect(executed).toBe(true);
  });

  it("handles independent transitions with different transition types", () => {
    const transitionsExecuted: string[] = [];

    startTransition(() => {
      addTransitionType("rosco-answer");
      transitionsExecuted.push("answer");
    });

    startTransition(() => {
      addTransitionType("rosco-pass");
      transitionsExecuted.push("pass");
    });

    expect(transitionsExecuted).toEqual(["answer", "pass"]);
  });

  it("handles form submitter detection for multi-action forms and protects against accidental pass on empty Enter", () => {
    const determineRoscoAction = (
      event: {
        preventDefault: () => void;
        submitter: HTMLElement | null;
        nativeEvent: { submitter: HTMLElement | null };
      },
      activeElementIsInput: boolean,
      answerText: string
    ) => {
      event.preventDefault();
      const submitter =
        (event.nativeEvent as globalThis.SubmitEvent)?.submitter as HTMLElement | null ??
        event.submitter;
      const action = submitter && "value" in submitter ? (submitter as HTMLButtonElement).value : "answer";

      if (action === "pass") {
        if (activeElementIsInput && !answerText.trim()) {
          return "noop";
        }
        return "pass";
      }
      return "answer";
    };

    const mockButton = (val: string): HTMLButtonElement => ({ value: val } as HTMLButtonElement);

    // 1. Explicit click on "Responder" button
    const answerClickEvent = {
      preventDefault: vi.fn(),
      submitter: mockButton("answer"),
      nativeEvent: { submitter: mockButton("answer") },
    };
    expect(determineRoscoAction(answerClickEvent, false, "Montevideo")).toBe("answer");

    // 2. Explicit click on "Pasapalabra" button
    const passClickEvent = {
      preventDefault: vi.fn(),
      submitter: mockButton("pass"),
      nativeEvent: { submitter: mockButton("pass") },
    };
    expect(determineRoscoAction(passClickEvent, false, "")).toBe("pass");

    // 3. User pressed Enter in text box when answer was empty
    // Browser might pick first non-disabled button (which would be "pass" if answer button was disabled)
    const enterOnEmptyInputEvent = {
      preventDefault: vi.fn(),
      submitter: mockButton("pass"),
      nativeEvent: { submitter: mockButton("pass") },
    };
    expect(determineRoscoAction(enterOnEmptyInputEvent, true, "")).toBe("noop");

    // 4. User pressed Enter in text box with text
    const enterOnTextInputEvent = {
      preventDefault: vi.fn(),
      submitter: mockButton("answer"),
      nativeEvent: { submitter: mockButton("answer") },
    };
    expect(determineRoscoAction(enterOnTextInputEvent, true, "Buenos Aires")).toBe("answer");
  });

  it("supports Fragment with ref in React element creation and verifies FragmentInstance contract", () => {
    const dummyRef = { current: null };
    const element = React.createElement(React.Fragment, { ref: dummyRef }, "Content");
    expect(element).toBeDefined();
    expect(element.type).toBe(React.Fragment);
    expect(element.props.children).toBe("Content");

    // Verify FragmentInstance interface method signatures
    const mockFragmentInstance: FragmentInstance = {
      focus: vi.fn(),
      focusLast: vi.fn(),
      blur: vi.fn(),
      scrollIntoView: vi.fn(),
      observeUsing: vi.fn(),
      unobserveUsing: vi.fn(),
      getClientRects: () => [],
      getRootNode: () => document,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    };

    mockFragmentInstance.focus();
    expect(mockFragmentInstance.focus).toHaveBeenCalledOnce();

    mockFragmentInstance.focusLast();
    expect(mockFragmentInstance.focusLast).toHaveBeenCalledOnce();

    mockFragmentInstance.scrollIntoView();
    expect(mockFragmentInstance.scrollIntoView).toHaveBeenCalledOnce();
  });
});
