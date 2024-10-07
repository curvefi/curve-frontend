import { RadioGroupState } from '@react-stately/radio'
import { createContext } from 'react'

const RadioContext = createContext<RadioGroupState>(undefined!)

export default RadioContext
