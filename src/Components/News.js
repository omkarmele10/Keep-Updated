import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import NewsItem from "./NewsItem";
import Sppiner from "./Sppiner";

const News = ({
  country = "in",
  pageSize = 1,
  category = "general",
  setProgress = () => { },
}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const capitalizeToUppercase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const updateNews = useCallback(
    async (pageToLoad = null, reset = false) => {
      setLoading(true);
      setErrorMessage("");
      setProgress(10);

      try {
        const apiKey = process.env.REACT_APP_NEWSDATA_API_KEY;
        if (!apiKey) {
          setLoading(false);
          setHasMore(false);
          setErrorMessage(
            "Add your NewsData.io API key to REACT_APP_NEWSDATA_API_KEY in .env, then restart the app."
          );
          setProgress(100);
          return;
        }

        const params = new URLSearchParams({
          apikey: apiKey,
          country,
          category: category === "general" ? "top" : category,
          language: "en",
          size: String(pageSize),
        });
        if (pageToLoad) {
          params.set("page", pageToLoad);
        }

        const response = await fetch(
          `https://newsdata.io/api/1/latest?${params.toString()}`
        );
        setProgress(50);
        const parsedData = await response.json();

        if (!response.ok || parsedData.status === "error") {
          setLoading(false);
          setHasMore(false);
          setErrorMessage(
            response.status === 429
              ? "NewsData.io rate limit reached. Please try again later."
              : parsedData.message ||
                parsedData.results?.[0]?.message ||
                "Something went wrong while loading the news."
          );
          setProgress(100);
          return;
        }

        const incomingArticles = Array.isArray(parsedData.results)
          ? parsedData.results
          : [];

        setArticles((prev) => {
          const base = reset ? [] : prev;
          const merged = base.concat(incomingArticles);

          const seenArticles = new Set();
          return merged.filter((article) => {
            const normalizedTitle = article.title
              ?.trim()
              .toLowerCase()
              .replace(/\s+/g, " ");
            const uniqueKey = normalizedTitle || article.url;

            if (!uniqueKey) {
              return true;
            }
            if (seenArticles.has(uniqueKey)) {
              return false;
            }

            seenArticles.add(uniqueKey);
            return true;
          });
        });

        setTotalResults(parsedData.totalResults ?? incomingArticles.length);
        setNextPage(parsedData.nextPage || null);
        setHasMore(Boolean(parsedData.nextPage));
        setLoading(false);
        setProgress(100);
      } catch (error) {
        setLoading(false);
        setHasMore(false);
        setErrorMessage(
          "Unable to load news right now. Please check your connection and try again."
        );
        setProgress(100);
      }
    },
    [country, category, pageSize, setProgress]
  );

  useEffect(() => {
    document.title = `${capitalizeToUppercase(category)} · Keep Updated`;
  }, [category]);

  useEffect(() => {
    setArticles([]);
    setNextPage(null);
    setHasMore(true);
    updateNews(null, true);
  }, [country, category, pageSize, updateNews]);

  const fetchMoreData = async () => {
    if (nextPage && !loading) {
      await updateNews(nextPage, false);
    }
  };

  return (
    <div className="container pt-5">
      <h2 className="text-center">Top Headlines ({totalResults})</h2>

      {errorMessage && (
        <div className="alert alert-warning my-3" role="alert">
          {errorMessage}
        </div>
      )}

      <InfiniteScroll
        dataLength={articles.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={loading && <Sppiner />}
      >
        <div className="container">
          <div className="row gy-4">
            {articles.map((item, index) => (
              <div className="col-sm-6 col-lg-4 d-flex" key={item.url || `${item.title}-${index}`}>
                <NewsItem
                  title={item.title || ""}
                  description={item.description || ""}
                  imageUrl={
                    item.image_url
                      ? item.image_url
                      : "https://img.freepik.com/free-vector/global-broadcast-breaking-news-banner-with-global-map_1017-59836.jpg?semt=ais_hybrid&w=740&q=80"
                  }
                  newsUrl={item.link || ""}
                  author={
                    Array.isArray(item.creator)
                      ? item.creator.join(", ").slice(0, 25)
                      : item.creator
                        ? item.creator.slice(0, 25)
                        : ""
                  }
                  date={item.pubDate}
                  source={item.source_name}
                />
              </div>
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </div>
  );
};

News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
  setProgress: PropTypes.func,
};

export default News;
