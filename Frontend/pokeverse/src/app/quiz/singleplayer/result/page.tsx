"use client";

import CompletedResult from "@/components/completedResult";
import React, { Suspense } from "react";

const ResultPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompletedResult />
    </Suspense>
  );
};

export default ResultPage;
