import * as yieldBasis from '../../src/yield-basis'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getSupportedChainSeed, getYieldBasisPoolSeed, nowRange, requestOptions } from '../seeds'

const chainSeed = endpointSeed(getSupportedChainSeed)
const yieldBasisPoolSeed = endpointSeed(getYieldBasisPoolSeed)

runEndpointCases('yield-basis', [
  endpointCase('getYieldBasisPools', () => yieldBasis.getYieldBasisPools(chainSeed(), requestOptions)),
  endpointCase('getYieldBasisPoolVolume', () =>
    yieldBasis.getYieldBasisPoolVolume(yieldBasisPoolSeed().chain, yieldBasisPoolSeed().poolAddress, requestOptions),
  ),
  endpointCase('getYieldBasisVolume', () => yieldBasis.getYieldBasisVolume(chainSeed(), requestOptions)),
  endpointCase('getCrvUsdYieldBasisSupply', () => yieldBasis.getCrvUsdYieldBasisSupply(chainSeed(), requestOptions)),
  endpointCase('getCrvUsdYieldBasisHistory', () =>
    yieldBasis.getCrvUsdYieldBasisHistory(chainSeed(), nowRange(), requestOptions),
  ),
])
