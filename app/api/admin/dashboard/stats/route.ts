import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated via session
    const sessionToken = request.cookies.get("admin_token")?.value;

    // Use Strapi admin token for backend API calls
    const token = STRAPI_ADMIN_TOKEN;

    // Check if admin session exists
    if (!sessionToken) {
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

    // Get a working admin token
    let workingToken = token;

    if (!workingToken) {
      console.log(
        "No STRAPI_ADMIN_TOKEN, trying to get fresh token via login...",
      );
      try {
        const loginResponse = await fetch(
          `${STRAPI_URL}/api/admin/auth/local`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: "superadmin@elitegames.com",
              password: "Passw0rd",
            }),
          },
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          workingToken = loginData.token;
          console.log("✅ Got fresh admin token for stats");
        } else {
          throw new Error(`Login failed: ${loginResponse.status}`);
        }
      } catch (loginError) {
        console.error("❌ Failed to get admin token:", loginError);
        return NextResponse.json(
          {
            totalGames: 0,
            totalUsers: 0,
            activeGames: 0,
            totalCategories: 0,
            error: "Backend authentication failed",
          },
          { status: 500 },
        );
      }
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
          { headers: { Authorization: `Bearer ${workingToken}` } },
        );

        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          totalGames =
            gamesData.meta?.pagination?.total || gamesData.length || 0;

          // Try to get active games count
          try {
            const activeGamesResponse = await fetchWithTimeout(
              `${STRAPI_URL}/api/games?filters[isActive][$eq]=true&pagination[limit]=1`,
              { headers: { Authorization: `Bearer ${workingToken}` } },
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

      // Try to fetch users count from the backend stats endpoint
      try {
        const statsResponse = await fetchWithTimeout(
          `${STRAPI_URL}/api/admin/stats`,
          { headers: { Authorization: `Bearer ${workingToken}` } },
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          totalUsers = statsData.totalUsers || 0;
          console.log("Backend stats data:", {
            totalUsers: statsData.totalUsers,
            totalGames: statsData.totalGames,
            totalQuestions: statsData.totalQuestions,
            totalCategories: statsData.totalCategories,
          });

          // Update all stats from backend if available
          if (statsData.totalGames !== undefined) {
            totalGames = statsData.totalGames;
          }
          if (statsData.totalCategories !== undefined) {
            totalCategories = statsData.totalCategories;
          }
        } else {
          console.warn(
            "Backend stats API failed:",
            statsResponse.status,
            await statsResponse.text(),
          );

          // Fallback: try direct users endpoint
          try {
            const usersResponse = await fetchWithTimeout(
              `${STRAPI_URL}/api/users-permissions/users?pagination[limit]=1`,
              { headers: { Authorization: `Bearer ${workingToken}` } },
            );

            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              totalUsers =
                usersData.meta?.pagination?.total || usersData.length || 0;
            }
          } catch (fallbackError) {
            console.warn("Fallback users API also failed:", fallbackError);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch users count:", error);
      }

      // Try to fetch categories count (handle 500 errors gracefully)
      try {
        const categoriesResponse = await fetchWithTimeout(
          `${STRAPI_URL}/api/categories?pagination[limit]=1`,
          { headers: { Authorization: `Bearer ${workingToken}` } },
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
