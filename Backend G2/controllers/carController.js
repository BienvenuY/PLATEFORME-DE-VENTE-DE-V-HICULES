const Car = require("../models/Car");
const Notification = require("../models/Notification");
const User = require("../models/User");

async function notifyUsersAboutSale(car) {
  const users = await User.find({
    favorites: car._id,
  }).select("_id");
  const title = "Voiture vendue";
  const body = `${car.brand} ${car.model} n'est plus disponible.`;
  await Notification.insertMany(
    users.map((u) => ({
      user: u._id,
      title,
      body,
      type: "sale",
    }))
  );
}

const listCars = async (req, res) => {
  try {
    const {
      brand,
      minPrice,
      maxPrice,
      year,
      minYear,
      maxYear,
      fuel,
      transmission,
      status,
      q,
      sort,
    } = req.query;

    const filter = {};
    if (brand) filter.brand = new RegExp(brand, "i");
    if (year) filter.year = Number(year);
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (fuel) filter.fuel = fuel;
    if (transmission) filter.transmission = transmission;
    if (status) filter.status = status;
    else filter.status = { $ne: "sold" };

    if (q) {
      filter.$or = [
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "year_desc") sortOption = { year: -1 };

    const cars = await Car.find(filter)
      .populate("seller", "first_name last_name email phone")
      .sort(sortOption)
      .lean();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const atlasSearchCars = async (req, res) => {
  const {
    q,
    brand,
    minPrice,
    maxPrice,
    year,
    minYear,
    maxYear,
    fuel,
    transmission,
  } = req.query;

  if (process.env.USE_ATLAS_SEARCH === "true") {
    try {
      const must = [];
      const filter = [];

      if (q) {
        must.push({
          text: {
            query: q,
            path: ["brand", "model", "description"],
            fuzzy: { maxEdits: 1 },
          },
        });
      }
      if (brand) {
        must.push({
          text: { query: brand, path: "brand" },
        });
      }
      if (fuel) filter.push({ equals: { path: "fuel", value: fuel } });
      if (transmission) {
        filter.push({ equals: { path: "transmission", value: transmission } });
      }
      if (year) filter.push({ equals: { path: "year", value: Number(year) } });
      if (minYear || maxYear) {
        const r = { path: "year" };
        if (minYear) r.gte = Number(minYear);
        if (maxYear) r.lte = Number(maxYear);
        filter.push({ range: r });
      }
      if (minPrice || maxPrice) {
        const r = { path: "price" };
        if (minPrice) r.gte = Number(minPrice);
        if (maxPrice) r.lte = Number(maxPrice);
        filter.push({ range: r });
      }
      filter.push({
        in: { path: "status", value: ["available", "reserved"] },
      });

      const searchStage = {
        $search: {
          index: process.env.ATLAS_SEARCH_INDEX || "default",
          compound: {
            must: must.length ? must : [{ exists: { path: "_id" } }],
            filter,
          },
        },
      };

      const cars = await Car.aggregate([
        searchStage,
        { $limit: 80 },
        {
          $lookup: {
            from: "users",
            localField: "seller",
            foreignField: "_id",
            as: "seller",
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  phone: 1,
                },
              },
            ],
          },
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      ]);
      return res.json(cars);
    } catch (e) {
      console.warn("Atlas Search indisponible, fallback regex:", e.message);
    }
  }

  req.query.q = q;
  return listCars(req, res);
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "seller",
      "first_name last_name email phone"
    );
    if (!car) return res.status(404).json({ message: "Voiture introuvable" });
    res.json(car);
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const createCar = async (req, res) => {
  try {
    const payload = { ...req.body, seller: req.user.id };
    const car = await Car.create(payload);
    const populated = await Car.findById(car._id).populate(
      "seller",
      "first_name last_name email phone"
    );
    res.status(201).json(populated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Données invalides", detail: e.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const prev = await Car.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: "Voiture introuvable" });

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("seller", "first_name last_name email phone");

    if (req.body.status === "sold" && prev.status !== "sold") {
      await notifyUsersAboutSale(car);
    }

    res.json(car);
  } catch (e) {
    res.status(400).json({ message: "Mise à jour impossible" });
  }
};

const deleteCar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé" });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const featuredCars = async (req, res) => {
  try {
    const cars = await Car.find({
      featured: true,
      status: { $in: ["available", "reserved"] },
    })
      .populate("seller", "first_name last_name email phone")
      .limit(8)
      .lean();
    res.json(cars);
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  listCars,
  atlasSearchCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  featuredCars,
  notifyUsersAboutSale,
};
