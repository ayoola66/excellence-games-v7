import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSettings() {
  const { data, error, mutate } = useSWR("/api/admin/settings", fetcher);

  return {
    settings: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
