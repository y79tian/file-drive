import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
}
export function SearchBar({ query, setQuery }: SearchBarProps) {
  return (
    <div>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
    </div>
  );
}
