import React, { useEffect } from "react";
import { useGetmyAssetsQuery, useGetAssetsQuery } from "@/store/api/assetsApi";

const AssetsChecker = () => {
  const { data, isLoading, error } = useGetAssetsQuery();

  // Log inside useEffect to see updates properly
  useEffect(() => {
    if (!isLoading) {
      console.log("Assets Data:", data);
      if (error) console.error("Error fetching assets:", error);
    }
  }, [data, isLoading, error]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error occurred!</p>;

  return (
    <div>
      <h2>Check console for assets data</h2>
      <p>Total assets fetched: {data?.length || 0}</p>
    </div>
  );
};

export default AssetsChecker;
