import React, {useRef, useEffect} from "react";
import {Runtime, Inspector} from "@observablehq/runtime";
import notebook from "31980671b2e4d2bf";

function Notebook() {
  const chartRef = useRef();

  useEffect(() => {
    const runtime = new Runtime();
    runtime.module(notebook, name => {
      if (name === "chart") return new Inspector(chartRef.current);
    });
    return () => runtime.dispose();
  }, []);

  return (
    <>
      <div ref={chartRef} />
      {/* <p>Credit: <a href="https://observablehq.com/d/31980671b2e4d2bf@716">World-Class Wines by Project-four</a></p> */}
    </>
  );
}

export default Notebook;