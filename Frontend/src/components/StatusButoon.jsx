const StatusButton = ({ status }) => {
 
  
const styles = {
  "under repair": {
    text: "#856404",
    bg: "#FFF3CD", // light yellow for warning
    dot: "#856404",
  },
  "assigned": {
    text: "#155724",
    bg: "#D4EDDA", // light green
    dot: "#155724",
  },
  "available": {
    text: "#155724",
    bg: "#D4EDDA", // light green
    dot: "#155724",
  },
  "complete": {
    text: "#155724",
    bg: "#D4EDDA", // light green
    dot: "#155724",
  },
  "pending": {
    text: "#0C5460",
    bg: "#D1ECF1", // light blue
    dot: "#0C5460",
  },
  "rejected": {
    text: "#721C24",
    bg: "#F8D7DA", // light red
    dot: "#721C24",
  },
};

const { text, bg, dot } = styles[status.toLowerCase()] || {
  text: "#000",
  bg: "#E0E0E0",
  dot: "#000",
};

  return (
    <button
      style={{ backgroundColor: bg, color: text }}
      className="flex items-center gap-2 px-4 py-1 text-sm rounded-full roboto font-normal"
    >
      <span
        style={{ backgroundColor: dot }}
        className="w-2 h-2 rounded-full inline-block"
      ></span>
      {status}
    </button>
  );
};

// Usage examples
export default StatusButton;