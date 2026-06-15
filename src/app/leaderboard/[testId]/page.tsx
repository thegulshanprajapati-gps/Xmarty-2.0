'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Trophy, Clock, ArrowLeft, Search, User } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  profilePicture: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  rank: number;
}

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (testId) {
      const fetchLeaderboard = async () => {
        try {
          const res = await fetch(`/api/tests/leaderboard?testId=${testId}`);
          if (!res.ok) {
            const errJson = await res.json();
            throw new Error(errJson.error || "Failed to load leaderboard");
          }
          const leaderboardData = await res.json();
          setData(leaderboardData);
        } catch (e: any) {
          setError(e.message || "Leaderboard error");
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [testId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Trophy className="h-12 w-12 text-amber-400 animate-bounce" />
          <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Syncing Leaderboard Ranks...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="text-center space-y-4 max-w-sm w-full bg-slate-950 p-8 rounded-[2rem] border border-white/10 shadow-xl">
          <Trophy className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold">No Leaderboard Data</h2>
          <p className="text-xs text-slate-400">{error || "Leaderboard is currently unavailable for this assessment."}</p>
          <button onClick={() => router.back()} className="w-full h-11 rounded-xl bg-white/10 text-foreground font-bold transition-all duration-200">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { testTitle, testDescription, leaderboardEnabled, leaderboard = [] } = data;

  const filteredLeaderboard = leaderboard.filter((entry: LeaderboardEntry) =>
    entry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  // Helper to layout podium
  const podiumOrder = [
    topThree[1], // 2nd place on left
    topThree[0], // 1st place in center
    topThree[2], // 3rd place on right
  ].filter(Boolean);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden pb-16">
      {/* Background lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
          <div className="space-y-1">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition duration-200 group py-1">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <h1 className="text-2xl font-headline font-black text-white">{testTitle || "Assessment Leaderboard"}</h1>
            <p className="text-xs text-slate-400 max-w-xl">{testDescription || "Real-time ranking of students based on scores and performance."}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Live Standings
          </div>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length > 0 && (
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Podium Standings</h2>
            
            <div className="flex justify-center items-end gap-3 sm:gap-8 w-full max-w-2xl px-4 pt-16">
              {podiumOrder.map((player: any) => {
                const isFirst = player.rank === 1;
                const isSecond = player.rank === 2;
                const isThird = player.rank === 3;

                let heightClass = "h-32 sm:h-40";
                let colorClass = "from-slate-700 to-slate-900 border-slate-500/30";
                let badgeColor = "bg-slate-500 text-white";
                let textGlow = "text-slate-400";

                if (isFirst) {
                  heightClass = "h-40 sm:h-52";
                  colorClass = "from-amber-500/20 to-amber-600/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]";
                  badgeColor = "bg-amber-500 text-slate-950 font-black";
                  textGlow = "text-amber-400";
                } else if (isThird) {
                  heightClass = "h-28 sm:h-32";
                  colorClass = "from-orange-700/20 to-orange-900/40 border-orange-700/30";
                  badgeColor = "bg-orange-700 text-white";
                  textGlow = "text-orange-500";
                }

                return (
                  <motion.div
                    key={player.userId}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: player.rank * 0.1 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    {/* Avatar */}
                    <div className="relative mb-3 group">
                      <div className={`absolute -inset-0.5 rounded-full blur opacity-30 ${isFirst ? "bg-amber-400" : isSecond ? "bg-slate-400" : "bg-orange-400"}`} />
                      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 overflow-hidden bg-slate-800 flex items-center justify-center relative ${isFirst ? "border-amber-400 w-16 h-16 sm:w-24 sm:h-24" : isSecond ? "border-slate-400" : "border-orange-500"}`}>
                        {player.profilePicture ? (
                          <img src={player.profilePicture} alt={player.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-500" />
                        )}
                        <span className={`absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 border-slate-950 ${badgeColor}`}>
                          {player.rank}
                        </span>
                      </div>
                    </div>

                    {/* Name / Score */}
                    <div className="text-center w-full max-w-[120px] sm:max-w-none">
                      <p className="font-bold text-xs sm:text-sm truncate">{player.fullName}</p>
                      <p className={`font-black text-sm sm:text-base ${textGlow}`}>{player.score} Qs</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{player.percentage}% Grade</p>
                    </div>

                    {/* Pedium Box */}
                    <div className={`w-full mt-4 rounded-t-2xl border-t border-x bg-gradient-to-b ${colorClass} ${heightClass} flex flex-col items-center justify-center p-3`}>
                      <span className="text-2xl sm:text-4xl font-extrabold opacity-20">{player.rank === 1 ? "1ST" : player.rank === 2 ? "2ND" : "3RD"}</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{Math.round(player.timeSpent / 60)}m {player.timeSpent % 60}s</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            placeholder="Search student names..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-900/60 text-white outline-none focus:border-indigo-500 transition-all text-xs"
          />
        </div>

        {/* Detailed Standings Table */}
        <div className="rounded-[2rem] border bg-slate-950/80 border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" /> Full Leaderboard
            </span>
            <span className="text-[10px] font-bold text-slate-400">{filteredLeaderboard.length} Students Ranked</span>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Trophy className="h-10 w-10 text-slate-700 mx-auto" />
              <p className="text-sm font-semibold">No participants found</p>
              <p className="text-xs text-slate-600">Be the first to complete the test and grab the top spot!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/60 text-slate-400">
                    <th className="px-6 py-3 font-bold uppercase tracking-wider w-16 text-center">Rank</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-center">Score</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-center">Accuracy</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-center">Time Taken</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider">Date Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeaderboard.map((player: LeaderboardEntry) => (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          player.rank === 1 ? "bg-amber-500 text-slate-950 font-black" :
                          player.rank === 2 ? "bg-slate-400 text-slate-950 font-black" :
                          player.rank === 3 ? "bg-orange-500 text-slate-950 font-black" :
                          "text-slate-400"
                        }`}>
                          {player.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-white/5">
                            {player.profilePicture ? (
                              <img src={player.profilePicture} alt={player.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{player.fullName}</p>
                            <p className="text-[9px] text-slate-500">{player.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-white text-sm">
                        {player.score} <span className="text-[10px] text-slate-500 font-normal">/ {player.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${player.percentage >= 50 ? "text-emerald-400" : "text-rose-500"}`}>{player.percentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 font-medium">
                        <span className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {Math.round(player.timeSpent / 60)}m {player.timeSpent % 60}s
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(player.submittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
