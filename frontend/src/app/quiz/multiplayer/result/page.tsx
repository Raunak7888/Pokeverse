"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import { Toaster, toast } from 'sonner';


type Player ={
  id: number,
  name: string,
  score: number,
  accuracy: number,
  streak: number,
  avatar: string,
  isCurrentUser: boolean,
}
const ResultLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [userRank, setUserRank] = useState<number|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  // Initial data that will be loaded
  const initialPlayers = [
    { id: 1, name: "Alex Chen", score: 2450, accuracy: 98, streak: 15, avatar: "AC", isCurrentUser: false },
    { id: 2, name: "Sarah Kim", score: 2380, accuracy: 95, streak: 12, avatar: "SK", isCurrentUser: false },
    { id: 3, name: "You", score: 2290, accuracy: 92, streak: 10, avatar: "YU", isCurrentUser: true },
    { id: 4, name: "Mike Johnson", score: 2150, accuracy: 88, streak: 8, avatar: "MJ", isCurrentUser: false },
    { id: 5, name: "Emma Davis", score: 2000, accuracy: 85, streak: 6, avatar: "ED", isCurrentUser: false },
    { id: 6, name: "Chris Lee", score: 1850, accuracy: 82, streak: 5, avatar: "CL", isCurrentUser: false },
    { id: 7, name: "Lisa Wang", score: 1720, accuracy: 78, streak: 4, avatar: "LW", isCurrentUser: false },
    { id: 8, name: "Tom Brown", score: 1600, accuracy: 75, streak: 3, avatar: "TB", isCurrentUser: false },
  ];

  useEffect(() => {
    // Load data after a delay to simulate API call
    const loadTimer = setTimeout(() => {
      setLeaderboardData(initialPlayers);
      const currentUserIndex = initialPlayers.findIndex(p => p.isCurrentUser);
      if (currentUserIndex !== -1) {
        setUserRank(currentUserIndex + 1);
      }
      setIsLoading(false);
      
      // Show success toast after loading
      setTimeout(() => {
        toast.success('Leaderboard loaded successfully!', {
          description: `You ranked #${currentUserIndex + 1} out of ${initialPlayers.length} players!`,
        });
        setAnimationComplete(true);
      }, 300);
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, []);

  const getRankIcon = (position:number) => {
    if (position === 1) {
      return <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />;
    } else if (position === 2) {
      return <Medal className="w-5 h-5 text-gray-300" />;
    } else if (position === 3) {
      return <Medal className="w-5 h-5 text-orange-400" />;
    } else {
      return <span className="text-gray-500 font-bold">#{position}</span>;
    }
  };

  const getRankGlow = (position:number) => {
    if (position === 1) return 'shadow-[0_0_30px_rgba(250,204,21,0.4)]';
    if (position === 2) return 'shadow-[0_0_20px_rgba(203,213,225,0.3)]';
    if (position === 3) return 'shadow-[0_0_20px_rgba(251,146,60,0.3)]';
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20, 
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen mt-15 bg-background p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </motion.div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Quiz Results
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Final standings after an epic battle of minds!
          </p>
        </motion.div>

        {/* Leaderboard Container */}
        {isLoading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <motion.div
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 sm:space-y-4"
            >
              {leaderboardData.map((player, index) => {
                const position = index + 1;
                const isCurrentUser = player.isCurrentUser;
                
                return (
                  <motion.div
                    key={player.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6
                      ${isCurrentUser 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-background border border-gray-200 dark:border-gray-800'
                      }
                      ${getRankGlow(position)}
                      transition-all duration-300 cursor-pointer
                    `}
                  >
                    {/* Animated background for current user */}
                    {isCurrentUser && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    )}

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left side - Rank and Player Info */}
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <motion.div
                          className="flex-shrink-0"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {getRankIcon(position)}
                        </motion.div>
                        
                        <div className="flex items-center gap-3 flex-1 sm:flex-none">
                          <motion.div
                            className={`
                              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base
                              ${position <= 3 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 dark:bg-gray-700'}
                            `}
                            whileHover={{ scale: 1.1 }}
                          >
                            {player.avatar}
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground text-sm sm:text-base">
                                {player.name}
                              </p>
                              {isCurrentUser && (
                                <motion.span
                                  className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  YOU
                                </motion.span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {player.accuracy}% accuracy
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {player.streak} streak
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Score */}
                      <motion.div
                        className="flex items-center gap-2 ml-auto sm:ml-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className={`
                          font-bold text-xl sm:text-2xl
                          ${position === 1 ? 'text-yellow-400' : 
                            position === 2 ? 'text-gray-400' : 
                            position === 3 ? 'text-orange-400' : 
                            'text-foreground'}
                        `}>
                          {player.score.toLocaleString()}
                        </span>
                      </motion.div>
                    </div>

                    {/* Progress bar for top 3 */}
                    {position <= 3 && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stats Summary */}
            {userRank && (
              <motion.div
                className="mt-8 p-4 sm:p-6 bg-background border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{userRank}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Your Rank</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{leaderboardData.length}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Total Players</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl  font-bold text-foreground ">92%</p>
                    <p className="text-xs sm:text-sm text-gray-500">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">2290</p>
                    <p className="text-xs sm:text-sm text-gray-500">Your Score</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultLeaderboard;