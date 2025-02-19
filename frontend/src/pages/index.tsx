import type { GetStaticProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { CurrencyCard } from "../components/CurrencyCard";
import { Toggle } from "../components/Toggle";

export type MoonPayCurrency = {
  id: string;
  code: string;
  name: string;
  supportsTestMode: boolean;
  isSupportedInUS: boolean;
  hidden?: boolean;
};

const Home: NextPage<{ initialCurrencies: MoonPayCurrency[] }> = ({
  initialCurrencies,
}) => {
  const [currencies, setCurrencies] =
    useState<MoonPayCurrency[]>(initialCurrencies);

  const [toggleSupportedInUs, setToggleSupportedInUs] = useState(false);
  const [toggleSupportsTestMode, setToggleSupportsTestMode] = useState(false);

  useEffect(() => {
    const filteredCurrencies = currencies.map((currency) => {
      const filterUs = toggleSupportedInUs && !currency.isSupportedInUS;
      const filterTestMode =
        toggleSupportsTestMode && !currency.supportsTestMode;

      return { ...currency, hidden: filterUs || filterTestMode };
    });
    setCurrencies(filteredCurrencies);
  }, [toggleSupportedInUs, toggleSupportsTestMode]);

  const SortAlphabetical = (sortKey: "name" | "code") => {
    const sortedCurrencies = currencies.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });
    setCurrencies([...sortedCurrencies]);
  };

  const Shuffle = () => {
    const shuffledCurrencies = [...currencies].sort(() => 0.5 - Math.random());
    setCurrencies(shuffledCurrencies);
  };

  return (
    <main className="main">
      <h1 className="title">MoonPay Full Stack Challenge</h1>

      <div className="controls">
        <Toggle
          label={
            <div style={{ display: "flex" }}>
              Supported in USA
            </div>
          }
          active={toggleSupportedInUs}
          onChange={setToggleSupportedInUs}
        />
        <Toggle
          label="Supports test mode"
          active={toggleSupportsTestMode}
          onChange={setToggleSupportsTestMode}
        />
      </div>
      <div className="controls">
        <Button onClick={() => SortAlphabetical("name")}>Sort by Name</Button>

        <Button onClick={() => SortAlphabetical("code")}>Sort by Symbol</Button>

        <Button onClick={Shuffle}>Shuffle Currency</Button>
      </div>

      <div className="grid">
        {currencies
          .filter((currency) => !currency.hidden)
          .map((currency) => (
            <CurrencyCard key={currency.id} currency={currency} />
          ))}
      </div>

      <a
        className="a"
        href="https://github.com/softskillpro"
        target="_blank"
        rel="noopener noreferrer"
      >
        Created by Softskillpro
      </a>
    </main>
  );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export const getStaticProps: GetStaticProps = async () => {
  const data = await fetcher("https://api.moonpay.com/v3/currencies");
  if (!data) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      initialCurrencies: data,
    },
  };
};

export default Home;
