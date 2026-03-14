import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params, _ctx) {
        const role = params.role as string | undefined;
        const experience = params.experience as string | undefined;
        const schedulingUrl = params.schedulingUrl as string | undefined;
        const interviewTypes = params.interviewTypes as string | undefined;
        const topics = params.topics as string | undefined;

        return {
          name: params.name as string,
          email: params.email as string,
          role: role && role !== "" ? (role as "interviewer" | "interviewee" | "both") : undefined,
          timezone: (params.timezone as string) || undefined,
          interviewTypes: interviewTypes ? JSON.parse(interviewTypes) : undefined,
          topics: topics ? JSON.parse(topics) : undefined,
          experience: experience && experience !== "" ? (experience as "beginner" | "intermediate" | "advanced") : undefined,
          schedulingUrl: schedulingUrl && schedulingUrl !== "" ? schedulingUrl : undefined,
        };
      },
    }),
  ],
});
