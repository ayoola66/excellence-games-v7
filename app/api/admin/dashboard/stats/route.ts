import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    // If no token, return default stats to prevent refresh loop
    if (!token) {
      return NextResponse.json(
        {
          totalGames: 0,
          totalUsers: 0,
          activeGames: 0,
          totalCategories: 0,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Default stats in case of errors
    let totalGames = 0;
    let totalUsers = 0;
    let activeGames = 0;
    let totalCategories = 0;

    try {
      // Fetch stats from Strapi with timeout
      const fetchWithTimeout = (
        url: string,
        options: RequestInit,
        timeout = 5000,
      ) => {
        return Promise.race([
          fetch(url, options),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout),
          ),
        ]);
      };

      // Try to fetch games count (handle 500 errors gracefully)
      try {
        const gamesResponse = await fetchWithTimeout(
          `${STRAPI_URL}/api/games?pagination[limit]=1`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          totalGames =
            gamesData.meta?.pagination?.total || gamesData.length || 0;

          // Try to get active games count
          try {
            const activeGamesResponse = await fetchWithTimeout(
              `${STRAPI_URL}/api/games?filters[isActive][$eq]=true&pagination[limit]=1`,
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (activeGamesResponse.ok) {
              const activeGamesData = await activeGamesResponse.json();
              activeGames =
                activeGamesData.meta?.pagination?.total ||
                activeGamesData.length ||
                0;
            }
          } catch (error) {
            console.warn("Failed to fetch active games count:", error);
          }
        } else {
          console.warn(
            "Games API failed:",
            gamesResponse.status,
            await gamesResponse.text(),
          );
          // Games endpoint has issues, keep totalGames = 0
        }
      } catch (error) {
        console.warn("Failed to fetch games count:", error);
      }

      // Try to fetch users count
      try {
        const usersResponse = await fetchWithTimeout(
          `${STRAPI_URL}/api/users?pagination[limit]=1`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Handle both Strapi v4 pagination format and direct array
          totalUsers =
            usersData.meta?.pagination?.total || usersData.length || 0;
          console.log("Users data:", {
            total: totalUsers,
            meta: usersData.meta,
          });
        } else {
          console.warn(
            "Users API failed:",
            usersResponse.status,
            await usersResponse.text(),
          );
        }
      } catch (error) {
        console.warn("Failed to fetch users count:", error);
      }

      // Try to fetch categories count (handle 500 errors gracefully)
      try {
        const categoriesResponse = await fetchWithTimeout(
          `${STRAPI_URL}/api/categories?pagination[limit]=1`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          totalCategories =
            categoriesData.meta?.pagination?.total ||
            categoriesData.length ||
            0;
        } else {
          console.warn(
            "Categories API failed:",
            categoriesResponse.status,
            await categoriesResponse.text(),
          );
          // Categories endpoint has issues, keep totalCategories = 0
        }
      } catch (error) {
        console.warn("Failed to fetch categories count:", error);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default stats instead of failing
    }

    return NextResponse.json({
      totalGames,
      totalUsers,
      activeGames,
      totalCategories,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    // Return default stats to prevent refresh loop
    return NextResponse.json(
      {
        totalGames: 0,
        totalUsers: 0,
        activeGames: 0,
        totalCategories: 0,
        error: "Failed to load statistics",
      },
      { status: 200 },
    ); // Return 200 to prevent refresh loop
  }
}
