import { z } from "zod";
import { Hono } from "hono";
import { verifyAuth } from "@/lib/auth-mock";
import { zValidator } from "@hono/zod-validator";

import { Project, projectsInsertSchema } from "@/db/schema";
import connectToDb from "@/lib/db";

const app = new Hono()
  .get(
    "/templates",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");

      await connectToDb();

      const data = await Project.find({ isTemplate: true })
        .sort({ isPro: 1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const data = await Project.findOneAndDelete({
        _id: id,
        userId: auth.token.id,
      });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } });
    },
  )
  .post(
    "/:id/duplicate",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const project = await Project.findOne({
        _id: id,
        userId: auth.token.id,
      });

      if (!project) {
        return c.json({ error: "Not found" }, 404);
      }

      const duplicateData = await Project.create({
        name: `Copy of ${project.name}`,
        json: project.json,
        width: project.width,
        height: project.height,
        userId: auth.token.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return c.json({ data: duplicateData });
    },
  )
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { page, limit } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const data = await Project.find({ userId: auth.token.id })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return c.json({
        data,
        nextPage: data.length === limit ? page + 1 : null,
      });
    },
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({ id: z.string() }),
    ),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          userId: true, // id is not in insertSchema but usually validation allows extra? removed explicit omit id which was not in my Zod definition
        })
        .partial()
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const data = await Project.findOneAndUpdate(
        {
          _id: id,
          userId: auth.token.id,
        },
        {
          ...values,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!data) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data });
    },
  )
  .get(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const data = await Project.findOne({
        _id: id,
        userId: auth.token.id,
      });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { name, json, height, width } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await connectToDb();

      const data = await Project.create({
        name,
        json,
        width,
        height,
        userId: auth.token.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!data) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data });
    },
  );

export default app;
