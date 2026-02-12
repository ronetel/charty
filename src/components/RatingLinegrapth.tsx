import React from "react";

type Rating = {
  id: number;
  title: string;
  count: number;
  percent: number;
};

const RatingLinegrapth = ({
  rating,
}: {
  rating: Rating[];
}) => {
  if (!rating) return null;

  const sortedRating = [...rating].sort((a, b) => {
    const order = ["exceptional", "recommended", "meh", "skip"];
    return order.indexOf(a.title) - order.indexOf(b.title);
  });

  const getRatingsColors = (title: string) => {
    switch (title) {
      case "exceptional":
        return "bg-green-500";
      case "recommended":
        return "bg-blue-500";
      case "meh":
        return "bg-yellow-500";
      case "skip":
        return "bg-red-500";
      default:
        return "bg-[#A1A1A1]";
    }
  };

  return (
    <div>
      <div className="mb-[10px] h-[50px] rounded-[10px] overflow-hidden flex">
        {sortedRating.map((rating) => (
          <div
            key={rating.id}
            style={{ width: `${rating.percent}%` }}
            className={getRatingsColors(rating.title)}
          />
        ))}
      </div>

      <div className="flex gap-x-5 flex-wrap gap-y-1 justify-center md:justify-start">
        {sortedRating.map((rating) => (
          <div key={rating.id} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getRatingsColors(rating.title)}`} />
            <span className="ml-2.5 font-semibold text-base">{(rating.title).charAt(0).toUpperCase() + (rating.title).slice(1)}</span>
            <span className="ml-1.5 text-sm text-[#A1A1A1]">{rating.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingLinegrapth;

