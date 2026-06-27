"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

type Cluster = {
  id: number;
  label: string;
  article_count: number;
  heat_score: number;
};

type Article = {
  id: number;
  title: string;
  source: string;
  published: string;
  url: string;
  summary?: string;
};

type SourceStat = {
  source: string;
  count: number;
};

type ClusterStat = {
  label: string;
  heat_score: number;
};

const COLORS = ["#ef4444", "#2563eb", "#22c55e", "#eab308"];

export default function Home() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStat[]>([]);
  const [topClusters, setTopClusters] = useState<ClusterStat[]>([]);

  const [clusterArticles, setClusterArticles] = useState<{
    [key: number]: Article[];
  }>({});

  const [expandedCluster, setExpandedCluster] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [sourceFilter, setSourceFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const loadData = async () => {

    try {

      setError("");

      const [
        clusterRes,
        sourceRes,
        topRes
      ] = await Promise.all([

        fetch(`${API}/clusters`),
        fetch(`${API}/stats/sources`),
        fetch(`${API}/stats/top-clusters`)

      ]);

      if (
        !clusterRes.ok ||
        !sourceRes.ok ||
        !topRes.ok
      ) {
        throw new Error("Backend Error");
      }

      const clusterData =
        await clusterRes.json();

      const sourceData =
        await sourceRes.json();

      const topData =
        await topRes.json();

      setClusters(clusterData);
      setSourceStats(sourceData);
      setTopClusters(topData);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to backend."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  const loadCluster = async (
    id: number
  ) => {

    if (expandedCluster === id) {

      setExpandedCluster(null);
      return;

    }

    if (!clusterArticles[id]) {

      const res =
        await fetch(
          `${API}/clusters/${id}`
        );

      const data =
        await res.json();

      setClusterArticles(prev => ({
        ...prev,
        [id]: data
      }));

    }

    setExpandedCluster(id);

  };

  const filteredClusters =
    clusters
      .filter(cluster =>
        cluster.label
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .filter(cluster => {

        if (
          sourceFilter === "All"
        )
          return true;

        const articles =
          clusterArticles[
          cluster.id
          ];

        if (!articles)
          return true;

        return articles.some(
          article =>
            article.source ===
            sourceFilter
        );

      });

  if (loading) {

    return (

      <main className="min-h-screen bg-black flex items-center justify-center text-white">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <h2 className="text-3xl font-bold mt-6">
            Loading NewsPulse...
          </h2>

          <p className="text-gray-400 mt-2">
            Fetching latest news...
          </p>

        </div>

      </main>

    );

  }

  if (error) {

    return (

      <main className="min-h-screen bg-black flex items-center justify-center text-white">

        <div className="text-center">

          <div className="text-6xl">
            ⚠️
          </div>

          <h2 className="text-3xl font-bold mt-4">
            Unable to load NewsPulse
          </h2>

          <p className="text-gray-400 mt-3">
            {error}
          </p>

          <button
            onClick={() =>
              loadData()
            }
            className="mt-6 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg"
          >
            Retry
          </button>

        </div>

      </main>

    );

  }
  return (
    <main className="min-h-screen bg-black text-white p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-5xl font-bold">
            🔥 NewsPulse
          </h1>

          <p className="text-gray-400 mt-2">
            Discover trending news from BBC & NPR
          </p>
        </div>

        <button
          disabled={refreshing}
          onClick={async () => {

            try {

              setRefreshing(true);

              await fetch(`${API}/refresh`, {
                method: "POST"
              });

              await new Promise(resolve =>
                setTimeout(resolve, 3000)
              );

              await loadData();

            } finally {

              setRefreshing(false);

            }

          }}
          className={`px-6 py-3 rounded-lg font-semibold transition ${refreshing
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {refreshing
            ? "⏳ Refreshing..."
            : "🔄 Refresh"}
        </button>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400">
            Clusters
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {clusters.length}
          </h2>
        </div>

        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400">
            Articles
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {clusters.reduce(
              (sum, c) => sum + c.article_count,
              0
            )}
          </h2>
        </div>

        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400">
            Top Heat Score
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {clusters[0]?.heat_score ?? 0}
          </h2>
        </div>

      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-gray-900 rounded-xl p-5">

          <h2 className="text-xl font-bold mb-4">
            Source Distribution
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={sourceStats}
                  dataKey="count"
                  nameKey="source"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={4}
                  label
                >

                  {sourceStats.map((_, index) => (

                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />

                  ))}

                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 10
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="bg-gray-900 rounded-xl p-5">

          <h2 className="text-xl font-bold mb-4">
            Top Trending Clusters
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <BarChart
                data={topClusters}
              >

                <XAxis
                  dataKey="label"
                  hide
                />

                <YAxis />

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 10
                  }}
                />

                <Bar
                  dataKey="heat_score"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="🔍 Search clusters..."
        className="
          w-full
          bg-gray-900
          border
          border-gray-700
          rounded-xl
          p-4
          outline-none
          mb-5
          focus:border-red-500
        "
      />

      {/* Filters */}

      <div className="flex gap-3 mb-8">

        {["All", "BBC", "NPR"].map(src => (

          <button
            key={src}
            onClick={() =>
              setSourceFilter(src)
            }
            className={`px-5 py-2 rounded-lg transition ${sourceFilter === src
                ? "bg-red-500"
                : "bg-gray-800"
              }`}
          >
            {src}
          </button>

        ))}

      </div>
      {/* Cluster Cards */}

      <div className="columns-1 md:columns-2 gap-5 space-y-5">

        {filteredClusters.length === 0 ? (

          <div className="text-center py-20">

            <div className="text-6xl">
              🔍
            </div>

            <h2 className="text-3xl font-bold mt-4">
              No News Found
            </h2>

            <p className="text-gray-400 mt-2">
              Try another search term.
            </p>

          </div>

        ) : (

          filteredClusters.map((cluster) => (

            <div
              key={cluster.id}
              onClick={() => loadCluster(cluster.id)}
              className="
                mb-5
                break-inside-avoid
                cursor-pointer
                border
                border-gray-700
                rounded-xl
                p-6
                hover:border-red-500
                hover:shadow-lg
                hover:shadow-red-500/10
                transition-all
              "
            >

              <h2 className="text-xl font-bold break-words">
                {cluster.label}
              </h2>

              <div className="flex justify-between mt-4">

                <span className="text-gray-400">
                  📰 {cluster.article_count} Articles
                </span>

                <span className="text-orange-400 font-semibold">
                  🔥 {cluster.heat_score}
                </span>

              </div>

              {expandedCluster === cluster.id && (

                <div className="mt-6 border-t border-gray-700 pt-5">

                  {clusterArticles[cluster.id]?.map((article) => (

                    <div
                      key={article.id}
                      className="mb-6 pb-5 border-b border-gray-800 last:border-0"
                    >

                      <div
                        className={`inline-block px-3 py-1 rounded text-sm font-semibold ${article.source === "BBC"
                            ? "bg-red-600"
                            : "bg-blue-600"
                          }`}
                      >
                        {article.source}
                      </div>

                      <h3 className="font-semibold text-lg mt-3 break-words">
                        {article.title}
                      </h3>

                      {article.summary && (

                        <p className="text-gray-400 mt-3">
                          {article.summary}
                        </p>

                      )}

                      <p className="text-gray-500 text-sm mt-3">
                        {article.published || "Unknown date"}
                      </p>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline mt-3 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Read Article →
                      </a>

                    </div>

                  ))}

                </div>

              )}

            </div>

          ))

        )}

      </div>
    </main>
  );
}
