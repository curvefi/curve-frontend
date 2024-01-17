import { createContext } from 'react'
import { RadioGroupState } from '@react-stately/radio'

const RadioContext = createContext<RadioGroupState>(undefined!)

export default RadioContext
