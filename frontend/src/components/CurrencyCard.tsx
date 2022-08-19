import { motion } from "framer-motion";
import React from "react";
import { MoonPayCurrency } from "../pages";

export interface CurrencyProps {
  currency: MoonPayCurrency;
}

export const CurrencyCard: React.FC<CurrencyProps> = ({
  currency,
  ...props
}) => {
  const currencyCoinMarketCapName = currency.name
    .toLowerCase()
    .split("(")[0]
    .trim()
    .split(" ")
    .join("-");
  return (
    <motion.a
      href={`https://coinmarketcap.com/currencies/${currencyCoinMarketCapName}/`}
      key={currency.id}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      layout
      {...props}
    >
      <h3>{currency.name}</h3>
      <p>Symbol: {currency.code}</p>
      <p>USA: {currency.isSupportedInUS ? "Supported" : "Not supported"} </p>
      <p>Test Mode: {currency.supportsTestMode ? "Supported" : "Not supported"} </p>
    </motion.a>
  );
};
