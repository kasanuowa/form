import React from "react"
import { render, screen } from "@testing-library/react"
import App from "./App"
import { Field } from "../src"
import userEvent from "@testing-library/user-event"

describe("Form control component", () => {
  test("default control is `input` tag", () => {
    render(
      <App>
        <Field name="f" label="F" />
      </App>,
    )
    const input = screen.getByLabelText("F")
    expect(input.tagName).toBe("INPUT")
  })
  test("customize control component", async () => {
    render(
      <App initValue={{ a: "", b: "b1", c: false }}>
        <Field name="a" label="A" />
        <Field
          name="b"
          label="B"
          control={
            <select className="custom-b">
              <option value="b1">B1</option>
              <option value="b2">B2</option>
            </select>
          }
        />
        <Field
          name="c"
          label="C"
          control={({ get, set }) => (
            <input
              id="custom-c"
              type="checkbox"
              checked={get()}
              onChange={({ target: { checked } }) => set(checked)}
            />
          )}
        />
      </App>,
    )
    const inputA = screen.getByLabelText("A")
    await userEvent.type(inputA, "a")
    expect(inputA).toHaveValue("a")

    const selectB = screen.getByLabelText("B")
    expect(selectB).toHaveClass("custom-b")
    await userEvent.selectOptions(selectB, screen.getByText("B2"))
    expect(selectB).toHaveValue("b2")

    const checkC = screen.getByLabelText("C")
    expect(checkC).toHaveAttribute("id", "custom-c")
    await userEvent.click(checkC)
    expect(checkC).toBeChecked()
  })
})