"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReviewData } from "@/utils/types"; // Assuming this path is correct

interface ReviewProps {
  playerId: number;
  roomId: number;
}

// A simple component to inject global styles for the custom scrollbar
const CustomScrollbarStyles = () => (
  <style jsx global>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #111827; /* bg-gray-900 */
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #4b5563; /* bg-gray-600 */
      border-radius: 10px;
      border: 2px solid #111827; /* bg-gray-900 */
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #6b7280; /* bg-gray-500 */
    }
  `}</style>
);


const Review: React.FC<ReviewProps> = ({ playerId, roomId }) => {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Define the async function to fetch stats
    const fetchStats = async () => {
      if (!playerId || !roomId) {
        setError("Player ID or Room ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Make the API call to fetch the review data
        const response = await axios.get(
          `http://localhost:8083/ws/stats/${roomId}/${playerId}`
        );
        // Set the fetched data into state
        setReviewData(response.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load game review. Please try again later.");
      } finally {
        // Stop the loading indicator
        setLoading(false);
      }
    };

    fetchStats();
    // Dependency array ensures this effect runs again if playerId or roomId changes
  }, [playerId, roomId]);

  // Render a loading state while fetching data
  if (loading) {
    return <div className="text-center p-8 text-gray-300">Loading review...</div>;
  }

  // Render an error message if the API call failed
  if (error) {
    return <div className="text-center p-8 text-red-400 bg-red-900/50 border border-red-700 rounded-lg">{error}</div>;
  }
  
  // Render a message if no data was returned
  if (!reviewData) {
    return <div className="text-center p-8 text-gray-500">No review data available.</div>;
  }

  return (<>
  {/* Assuming CustomScrollbarStyles is defined elsewhere as in previous examples */}
  <div className="p-4 sm:p-6 max-w-5xl mx-auto font-sans bg-[#121212] text-gray-200 rounded-2xl shadow-xl">
    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-white">
      Game <span className="text-[#EE4035]">Review</span>
    </h2>

    <div className="bg-[#1b1b1b] shadow-inner border border-gray-700 p-4 sm:p-6 rounded-xl space-y-6">
      {/* User Info Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-400">Username</p>
          <p className="font-semibold text-lg text-white">{reviewData.username}</p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm text-gray-400">Total Points</p>
          <p className="font-bold text-3xl text-[#EE4035]">{reviewData.totalPoints}</p>
        </div>
      </div>

      {/* Detailed Answers Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white border-t border-gray-700 pt-6">
          Detailed Answers
        </h3>
        
        {/* This is the container that enables scrolling */}
        <div className="h-[40vh] overflow-y-auto custom-scrollbar pr-2">
          {reviewData.detailedAnswers?.length > 0 ? (
            <table className="w-full text-sm text-left border-separate" style={{ borderSpacing: '0 0.5rem' }}>
              <thead className="sticky top-0 z-10">
                {/* The extra div provides a solid background for the sticky header */}
                <tr className="bg-[#1b1b1b]"> 
                  {["Question", "Your Answer", "Correct Answer", "Time(s)", "Result"].map(
                    (title) => (
                      <th
                        key={title}
                        className="px-4 py-3 text-gray-300 font-semibold uppercase  "
                      >
                        {title}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              
              {/* The tbody contains the scrollable content */}
              <tbody>
                {reviewData.detailedAnswers.map((ans) => {
                  const isCorrect = ans.correct;
                  return (
                    <tr
                      key={ans.questionId}
                      className={`transition-colors  duration-200 ${
                        isCorrect
                          ? "bg-[#173821] hover:bg-[#1e4e2b]"
                          : "bg-[#3b1c1c] hover:bg-[#502424]"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-200 rounded-l-lg">{ans.question}</td>
                      <td
                        className={`px-4 py-3 text-center font-medium ${
                          isCorrect ? "text-gray-200" : "text-red-400"
                        }`}
                      >
                        {ans.selectedOption}
                      </td>
                      <td className="px-4 py-3 text-center text-[#8fff8f] font-medium">
                        {ans.correctAnswer}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {ans.timeTaken}
                      </td>
                      <td className="px-4 py-3 text-center font-bold rounded-r-lg">
                        {isCorrect ? (
                          <span className="text-green-400">✅ Correct</span>
                        ) : (
                          <span className="text-[#EE4035]">❌ Wrong</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-6">
              No detailed answers to display.
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
</>

  );
};

export default Review;
