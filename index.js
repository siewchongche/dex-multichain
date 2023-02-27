const { ethers } = require("ethers")

// === user interaction part ===

const tokenAddr = ""
const amount = ethers.utils.parseEther("0.1") // "0.1" means 0.1 native token (eth/bnb/matic/avax)
const slippage = 30 // 30% slippage, minimum receive 70% of token
let deadline = 60 // 60 seconds before transaction expired

// uncomment one network & one dexName below

// ethereum
// const network = "ethereum"
// const dexName = "uniswap v2" // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
// const dexName = "uniswap v3" // 0xE592427A0AEce92De3Edee1F18E0157C05861564, need check fee, default 0.3%
// const dexName = "sushiswap" // 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F
// const dexName = "solidly v2" // 0x77784f96C936042A3ADB1dD29C91a55EB2A4219f

// bsc
// const network = "bsc"
// const dexName = "pancakeswap" // 0x10ED43C718714eb63d5aA57B78B54704E256024E
// const dexName = "biswap" // 0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8
// const dexName = "thena" // 0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109

// arbitrum
const network = "arbitrum"
// const dexName = "zyberswap" // 0x16e71B13fE6079B4312063F7E81F76d165Ad32Ad
// const dexName = "uniswap v3" // 0xE592427A0AEce92De3Edee1F18E0157C05861564, need check fee, default 0.3%
// const dexName = "sushiswap" // 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506
// const dexName = "solidlizard" // 0xF26515D5482e2C2FD237149bF6A653dA4794b3D0
const dexName = "camelot" // 0xc873fEcbd354f5A56E00E710B90EF4201db2448d

// polygon
// const network = "polygon"
// const dexName = "quickswap" // 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
// const dexName = "quickswap v3" // 0xf5b509bB0909a69B1c207E495f687a596C168E12
// const dexName = "uniswap v3" // 0xE592427A0AEce92De3Edee1F18E0157C05861564, need check fee, default 0.3%
// const dexName = "sushiswap" // 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506

// avalanche
// const network = "avalanche"
// const dexName = "trader joe" // 0x60aE616a2155Ee3d9A68541Ba4544862310933d4, not v2
// const dexName = "pangolin" // 0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106

// optimism
// const network = "optimism"
// const dexName = "velodrome" // 0x9c12939390052919aF3155f41Bf4160Fd3666A6f
// const dexName = "uniswap v3" // 0xE592427A0AEce92De3Edee1F18E0157C05861564, need check fee, default 0.3%

// === user interaction end ===



const uniswap_v2_abi = require("./abis/uniswap_v2_abi.json")
const uniswap_v3_abi = require("./abis/uniswap_v3_abi.json")
const solid_lizard_abi = require("./abis/solid_lizard_abi.json")
const camelot_abi = require("./abis/camelot_abi.json")
const solidly_abi = require("./abis/solidly_abi.json")
const quickswap_v3_abi = require("./abis/quickswap_v3_abi.json")
const pangolin_abi = require("./abis/pangolin_abi.json")
require("dotenv").config()

const quoter = new ethers.Contract(
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  ["function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)"]
)

const quoter_quickswap = new ethers.Contract(
  "0xa15F0D7377B2A0C0c10db057f641beD21028FC89",
  ["function quoteExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint160 limitSqrtPrice) external view returns (uint256 amountOut)"]
)

deadline = Math.floor(Date.now() / 1000) + deadline

const getRpc = (network, isTesting) => {
  let rpc, url, wNativeAddr
  if (network == "ethereum") {
    rpc = "eth"
    wNativeAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  } else if (network == "bsc") {
    rpc = "bsc"
    wNativeAddr = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  } else if (network == "arbitrum") {
    rpc = "arbitrum"
    wNativeAddr = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
  } else if (network == "polygon") {
    rpc = "polygon"
    wNativeAddr = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
  } else if (network == "avalanche") {
    rpc = "avalanche"
    wNativeAddr = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
  } else if (network == "optimism") {
    rpc = "optimism"
    wNativeAddr = "0x4200000000000000000000000000000000000006"
  }

  if (isTesting) {
    url = "http://localhost:8545"
  } else {
    url = `https://rpc.ankr.com/${rpc}`
  }

  return {
    provider: new ethers.providers.JsonRpcProvider(url),
    wNativeAddr: wNativeAddr
  }
}

const getDex = (network, dexName, signer) => {
  if (dexName == "zyberswap") {
    const dexAddr = "0x16e71B13fE6079B4312063F7E81F76d165Ad32Ad"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "uniswap v3") {
    const dexAddr = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v3_abi, signer),
      type: "uniswap_v3_fork"
    }

  } else if (dexName == "sushiswap") {
    let dexAddr
    if (network == "ethereum") dexAddr = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
    else if (network == "arbitrum") dexAddr = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    else if (network == "polygon") dexAddr = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "solidlizard") {
    const dexAddr = "0xF26515D5482e2C2FD237149bF6A653dA4794b3D0"
    return {
      contract: new ethers.Contract(dexAddr, solid_lizard_abi, signer),
      type: "solid_lizard"
    }

  } else if (dexName == "camelot") {
    const dexAddr = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d"
    return {
      contract: new ethers.Contract(dexAddr, camelot_abi, signer),
      type: "camelot"
    }

  } else if (dexName == "uniswap v2") {
    const dexAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "solidly v2") {
    const dexAddr = "0x77784f96C936042A3ADB1dD29C91a55EB2A4219f"
    return {
      contract: new ethers.Contract(dexAddr, solidly_abi, signer),
      type: "solidly_fork"
    }

  } else if (dexName == "pancakeswap") {
    const dexAddr = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "biswap") {
    const dexAddr = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "thena") {
    const dexAddr = "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109"
    return {
      contract: new ethers.Contract(dexAddr, solidly_abi, signer),
      type: "solidly_fork"
    }

  } else if (dexName == "quickswap") {
    const dexAddr = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
    return {
      contract: new ethers.Contract(dexAddr, uniswap_v2_abi, signer),
      type: "uniswap_v2_fork"
    }

  } else if (dexName == "quickswap v3") {
    const dexAddr = "0xf5b509bB0909a69B1c207E495f687a596C168E12"
    return {
      contract: new ethers.Contract(dexAddr, quickswap_v3_abi, signer),
      type: "quickswap_v3"
    }

  } else if (dexName == "trader joe") {
    const dexAddr = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4"
    return {
      contract: new ethers.Contract(dexAddr, pangolin_abi, signer),
      type: "pangolin_fork"
    }

  } else if (dexName == "pangolin") {
    const dexAddr = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"
    return {
      contract: new ethers.Contract(dexAddr, pangolin_abi, signer),
      type: "pangolin_fork"
    }

  } else if (dexName == "velodrome") {
    const dexAddr = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f"
    return {
      contract: new ethers.Contract(dexAddr, solidly_abi, signer),
      type: "solidly_fork"
    }

  }
}

const main = async () => {
  const rpc = getRpc(network, false)
  // const rpc = getRpc(network, true) // for testing purpose
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, rpc.provider)
  const dex = getDex(network, dexName, signer)

  console.log(`Wallet address: ${signer.address}`)
  console.log(`Native token amount in wallet: ${ethers.utils.formatEther(await signer.getBalance())}`)
  console.log(`Swapping ${ethers.utils.formatEther(amount)} of native token to token ${tokenAddr}`)
  console.log(`Dex used: ${dexName}, slippage set: ${slippage}%`)

  if (dex.type == "uniswap_v2_fork") {
    const path = [rpc.wNativeAddr, tokenAddr]
    const amountOut = (await dex.contract.getAmountsOut(amount, path))[1]
    await dex.contract.swapExactETHForTokens(
      amountOut.mul(100 - slippage).div(100),
      path,
      signer.address,
      deadline,
      {value: amount}
    )

  } else if (dex.type == "uniswap_v3_fork") {
    const fee = 3000
    const amountOut = await quoter.connect(rpc.provider).quoteExactInputSingle(
      rpc.wNativeAddr, tokenAddr, fee, amount, 0
    )
    await dex.contract.exactInputSingle({
      tokenIn: rpc.wNativeAddr,
      tokenOut: tokenAddr,
      fee: fee,
      recipient: signer.address,
      deadline: deadline,
      amountIn: amount,
      amountOutMinimum: amountOut.mul(100 - slippage).div(100),
      sqrtPriceLimitX96: 0
    }, {value: amount})

  } else if (dex.type == "solid_lizard") {
    const [amountOut, stable] = await dex.contract.getAmountOut(
      amount, rpc.wNativeAddr, tokenAddr
    )
    await dex.contract.swapExactMATICForTokens(
      amountOut.mul(100 - slippage).div(100),
      [{
        from: rpc.wNativeAddr,
        to: tokenAddr,
        stable: stable
      }],
      signer.address,
      deadline,
      {value: amount}
    )

  } else if (dex.type == "camelot") {
    const path = [rpc.wNativeAddr, tokenAddr]
    const amountOut = (await dex.contract.getAmountsOut(amount, path))[1]
    await dex.contract.swapExactETHForTokensSupportingFeeOnTransferTokens(
      amountOut.mul(100 - slippage).div(100),
      path,
      signer.address,
      signer.address,
      deadline,
      {value: amount}
    )

  } else if (dex.type == "solidly_fork") {
    const [amountOut, stable] = await dex.contract.getAmountOut(
      amount, rpc.wNativeAddr, tokenAddr
    )
    await dex.contract.swapExactETHForTokens(
      amountOut.mul(100 - slippage).div(100),
      [{
        from: rpc.wNativeAddr,
        to: tokenAddr,
        stable: stable
      }],
      signer.address,
      deadline,
      {value: amount}
    )

  } else if (dex.type == "quickswap_v3") {
    const amountOut = await quoter_quickswap.connect(rpc.provider).quoteExactInputSingle(
      rpc.wNativeAddr, tokenAddr, amount, 0
    )
    await dex.contract.exactInputSingle({
      tokenIn: rpc.wNativeAddr,
      tokenOut: tokenAddr,
      recipient: signer.address,
      deadline: deadline,
      amountIn: amount,
      amountOutMinimum: amountOut.mul(100 - slippage).div(100),
      limitSqrtPrice: 0,
    }, {value: amount})

  } else if (dex.type == "pangolin_fork") {
    const path = [rpc.wNativeAddr, tokenAddr]
    const amountOut = (await dex.contract.getAmountsOut(amount, path))[1]
    await dex.contract.swapExactAVAXForTokens(
      amountOut.mul(100 - slippage).div(100),
      path,
      signer.address,
      deadline,
      {value: amount}
    )

  }

  console.log(`Swap successfully`)
}
main()