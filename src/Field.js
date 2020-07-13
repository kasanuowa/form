import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
} from "react"
import { Context } from "./Form"
import useComponent from "./useComponent"
import { join } from "./path"

const defaultControl = <input />

const changed = (a, b) => a !== b && !(Number.isNaN(a) || Number.isNaN(b))

const defaultRender = ({ Control, labelElem, error }) => (
  <div>
    <label>
      {labelElem} <Control />
    </label>
    {error}
  </div>
)

const Field = (props) => {
  const {
    name,
    control,
    label: labelElem,
    render,
    validators = {},
    ...rules
  } = props
  const {
    fieldRender,
    get,
    set,
    listen,
    path: ctxPath,
    control: ctxControl,
    validators: ctxValidators,
  } = useContext(Context)
  const r = render || fieldRender || defaultRender
  const c = control || ctxControl || defaultControl
  const v = {
    ...ctxValidators,
    ...validators,
  }
  const fullPath = join(ctxPath, name)
  const [value, forceUpdate] = useState(() => get(fullPath))
  const [error, setError] = useState(null)
  const prevValue = useRef(value)
  const instance = useRef()
  const validate = () => {
    let error = null
    for (const [rule, param] of Object.entries(rules)) {
      const message = v[rule]?.(value, param)
      if (message) {
        error = message
        break
      }
    }
    setError(error)
    return error
  }
  useImperativeHandle(instance, () => ({
    update: forceUpdate,
    validate,
  }))
  useEffect(() => {
    return listen(fullPath, instance)
  }, [fullPath])
  const formProps = {}
  if (typeof c === "function") {
    formProps.get = () => value
    formProps.set = (v, n = name) => set(v, join(ctxPath, n))
  } else {
    formProps.value = value
    formProps.onChange = ({ target: { value } }) => {
      set(value, fullPath)
    }
  }

  useEffect(() => {
    if (changed(prevValue.current, value)) {
      validate()
    }
    prevValue.current = value
  })

  const Control = useComponent(c, formProps)
  return r({ Control, labelElem, error, id: fullPath }, props)
}

export default Field
