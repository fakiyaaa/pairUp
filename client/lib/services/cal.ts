import { get, post } from "@/lib/services/api";

export const calApi = {
  getConnectUrl: () => get<{ url: string }>("/auth/cal/connect"),

  exchange: (code: string) =>
    post<{ cal_com_link: string }>("/auth/cal/exchange", { code }),
};
