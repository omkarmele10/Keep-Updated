import React from "react";

const NewsItem = (props) => {
  let { title, description, imageUrl, newsUrl, author, date, source } = props;
  const publishedDate = date && !Number.isNaN(Date.parse(date))
    ? new Date(date).toUTCString()
    : "Date unavailable";

  return (
    <div className="card news-card h-100 w-100 my-0 position-relative">
      <span className="news-card-source position-absolute top-0 end-0 badge rounded-pill bg-danger m-2">
        {source || "Unknown source"}
      </span>
      <img
        src={imageUrl}
        className="card-img-top news-card-image"
        alt={title || "News article"}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title news-card-title" title={title}>
          {title || "Title unavailable"}
        </h5>
        <p className="card-text news-card-description" title={description}>
          {description || "No description available."}
        </p>
        <p className="card-text news-card-meta">
          <small className="text-body-secondary">
            By {author || "Unknown"} on {publishedDate}
          </small>
        </p>
        <a
          href={newsUrl || undefined}
          rel="noreferrer"
          target="_blank"
          className={`btn btn-primary mt-auto${newsUrl ? "" : " disabled"}`}
          aria-disabled={!newsUrl}
        >
          Read More
        </a>
      </div>
    </div>
  );
}

export default NewsItem;
