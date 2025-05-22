import { Router } from "express";
import db from "@repo/db";
import { userMiddleware } from "../../middlewares/user";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "@repo/common";

export const spaceRouter: Router = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  try {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
      console.log(JSON.stringify(parsedData));
      res.status(400).json({ message: "Validation failed" });
      return;
    }

    if (!parsedData.data.mapId) {
      const space = await db.space.create({
        data: {
          name: parsedData.data.name,
          thumbnail: parsedData.data.thumbnail,
          width: Number.parseInt(
            parsedData.data.dimensions?.split("x")[0] || "0"
          ),
          height: Number.parseInt(
            parsedData.data.dimensions?.split("x")[1] || "0"
          ),
          creatorId:
            req.userId ||
            (() => {
              throw new Error("User ID is undefined");
            })(),
        },
      });
      res.json({
        id: space.id,
        name: space.name,
        thumbnail: space.thumbnail,
        dimensions: `${space.width}x${space.height}`,
      });
      return;
    }

    const map = await db.map.findFirst({
      where: { id: parsedData.data.mapId },
      select: { mapElements: true, width: true, height: true },
    });

    if (!map) {
      res.status(400).json({ message: "Map not found" });
      return;
    }

    const space = await db.$transaction(async () => {
      const space = await db.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId:
            req.userId ||
            (() => {
              throw new Error("User ID is undefined");
            })(),
        },
      });

      await db.spaceElement.createMany({
        data: map.mapElements.map((e) => {
          if (e.x === null || e.x === undefined) {
            throw new Error("x is undefined or null");
          }
          if (e.y === null || e.y === undefined) {
            throw new Error("y is undefined or null");
          }
          return {
            spaceId: space.id,
            elementId: e.elementId,
            x: e.x,
            y: e.y,
          };
        }),
      });

      return space;
    });

    res.json({ spaceId: space.id });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedData = DeleteElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  const spaceElement = await db.spaceElement.findFirst({
    where: { id: parsedData.data.id },
    include: { space: true },
  });

  if (!spaceElement?.space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (
    !spaceElement?.space.creatorId ||
    spaceElement.space.creatorId !== req.userId
  ) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await db.spaceElement.delete({
    where: { id: parsedData.data.id },
  });

  res.json({ message: "Element deleted" });
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const space = await db.space.findUnique({
    where: { id: req.params.spaceId },
    select: { creatorId: true },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (space.creatorId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await db.space.delete({
    where: { id: req.params.spaceId },
  });

  res.json({ message: "Space deleted" });
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  try {
    const userSpaces = await db.userSpace.findMany({
      where: { userId: req.userId },
      include: { space: true },
    });

    const spaces = userSpaces.map((userSpace) => ({
      id: userSpace.space.id,
      name: userSpace.space.name,
      thumbnail: userSpace.space.thumbnail,
      dimensions: `${userSpace.space.width}x${userSpace.space.height}`,
    }));

    res.json({ spaces });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = AddElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  const space = await db.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId,
    },
    select: {
      width: true,
      height: true,
    },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (
    req.body.x < 0 ||
    req.body.y < 0 ||
    req.body.x > space.width ||
    req.body.y > space.height
  ) {
    res.status(400).json({ message: "Point is outside of the boundary" });
    return;
  }

  await db.spaceElement.create({
    data: {
      spaceId: req.body.spaceId,
      elementId: req.body.elementId,
      x: req.body.x,
      y: req.body.y,
    },
  });

  res.json({ message: "Element added" });
});

spaceRouter.get("/:spaceId", async (req, res) => {
  const space = await db.space.findUnique({
    where: { id: req.params.spaceId },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  res.json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.elements.map((e) => ({
      id: e.id,
      element: {
        id: e.element.id,
        imageUrl: e.element.imageUrl,
        width: e.element.width,
        height: e.element.height,
        static: e.element.static,
      },
      x: e.x,
      y: e.y,
    })),
  });
});
