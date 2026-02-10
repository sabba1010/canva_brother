import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { zValidator } from "@hono/zod-validator";

import { User } from "@/db/schema";
import connectToDb from "@/lib/db";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    async (c) => {
      const { name, email, password } = c.req.valid("json");

      const hashedPassword = await bcrypt.hash(password, 12);

      await connectToDb();

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return c.json({ error: "Email already in use" }, 400);
      }

      await User.create({
        email,
        name,
        password: hashedPassword,
      });

      return c.json(null, 200);
    },
  );

export default app;
