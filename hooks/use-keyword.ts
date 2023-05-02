import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import GLOBALS from "@/global.json";

interface Data {
  word: string;
}
export const useKeyword = () => {
  return useQuery({
    queryKey: [],
    queryFn: async () => {
      const { data } = await axios.get(GLOBALS.WORD_ROUTE);
      return data as Data;
    },
  });
};
