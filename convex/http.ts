import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const http = httpRouter();

// Cal.com fires this webhook when a booking is created/confirmed.
// It looks up both users by email and stores the session in the DB.
http.route({
  path: "/webhooks/cal",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CAL_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const signature = request.headers.get("x-cal-signature-256");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    const rawBody = await request.text();

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSignature !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.triggerEvent !== "BOOKING_CREATED") {
      return new Response(null, { status: 200 });
    }

    const { payload } = body;
    const organizerEmail: string = payload.organizer?.email;
    const attendeeEmail: string = payload.attendees?.[0]?.email;
    const startTime: string = payload.startTime;
    const meetingUrl: string | undefined =
      payload.videoCallData?.url ?? payload.meetingUrl;
    const calBookingUid: string = payload.uid;
    const interviewTypeName: string | undefined =
      payload.metadata?.interviewType;

    if (!organizerEmail || !attendeeEmail || !startTime) {
      return new Response("Missing required booking fields", { status: 400 });
    }

    await ctx.runMutation(internal.sessions.createFromWebhook, {
      organizerEmail,
      attendeeEmail,
      scheduledAt: new Date(startTime).getTime(),
      meetingLink: meetingUrl,
      calBookingUid,
      interviewTypeName,
    });

    return new Response(null, { status: 200 });
  }),
});

export default http;
