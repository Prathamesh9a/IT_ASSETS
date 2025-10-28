import * as React from "react";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts/PieChart";
import Stack from "@mui/material/Stack";

const data = [
  { id: 0, value: 10, label: "Series A" },
  { id: 1, value: 15, label: "Series B" },
  { id: 2, value: 20, label: "Series C" },
  { id: 3, value: 25, label: "Series D" },
  { id: 4, value: 30, label: "Series E" },
];

export default function ResponsivePie() {
  return (
    <Stack>
      <div
        style={{
          width: "100%",
          maxWidth: "700px", // optional max width
          aspectRatio: "1 / 1", // keeps chart square
           display: "flex",
    justifyContent: "center",
    alignItems: "center",
        }}
      >
        <PieChart
          series={[
            {
              data,
              arcLabel: (item) => `${item.value}%`, // show values
              labelPosition: "inside", // labels inside slices
              
            },
          ]}
          width={undefined} // let container handle size
          height={undefined} // let container handle size
           margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white", // label color
              fontSize: 14, // label size
              fontWeight: "bold",
            },
          }}
        />
      </div>
    </Stack>
  );
}
