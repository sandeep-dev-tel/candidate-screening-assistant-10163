import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);
  expect(screen.getByText(/Upload CVs/i)).toBeInTheDocument();
  expect(screen.getByText(/Criteria/i)).toBeInTheDocument();
  expect(screen.getByText(/Results/i)).toBeInTheDocument();
});
