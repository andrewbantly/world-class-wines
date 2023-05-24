import React, {useRef, useEffect} from "react";
import {Runtime, Inspector} from "@observablehq/runtime";
import notebook from "823cc41fe7c9b1d3";

function Notebook() {
  const wineChartRef = useRef();

  useEffect(() => {
    const runtime = new Runtime();
    runtime.module(notebook, name => {
      if (name === "wineChart") return new Inspector(wineChartRef.current);
    });
    return () => runtime.dispose();
  }, []);

  return (
    <>
      <div ref={wineChartRef} />
      <p>Credit: <a href="https://observablehq.com/d/823cc41fe7c9b1d3@170">World-Class Wines by Project-four</a></p>
    </>
  );
}

export default Notebook;