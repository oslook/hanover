"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";

function MainComponent() {
  const [disks, setDisks] = useState(3);
  const [towers, setTowers] = useState([[], [], []]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const initializeTowers = useCallback(() => {
    const initialTowers = [
      Array.from({ length: disks }, (_, i) => disks - i),
      [],
      [],
    ];
    setTowers(initialTowers);
    setMoves(0);
    setGameStarted(true);
    setStartTime(Date.now());
    setEndTime(null);
    setGameTime(0);
    setIsAutoPlaying(false);
  }, [disks]);
  const autoMove = useCallback((n, source, auxiliary, target) => {
    if (n === 1) {
      return [[source, target]];
    }
    return [
      ...autoMove(n - 1, source, target, auxiliary),
      [source, target],
      ...autoMove(n - 1, auxiliary, source, target),
    ];
  }, []);
  const startAutoPlay = useCallback(() => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);

    const moves = autoMove(disks, 0, 1, 2);
    let moveIndex = 0;

    const interval = setInterval(() => {
      if (moveIndex >= moves.length) {
        clearInterval(interval);
        setIsAutoPlaying(false);
        return;
      }

      const [from, to] = moves[moveIndex];
      const newTowers = [...towers];
      const disk = newTowers[from].pop();
      newTowers[to].push(disk);
      setTowers(newTowers);
      setMoves((prev) => prev + 1);

      if (to === 2 && newTowers[2].length === disks) {
        const endTimeStamp = Date.now();
        setEndTime(endTimeStamp);
        setGameStarted(false);
        const totalTime = Math.floor((endTimeStamp - startTime) / 1000);
        setHistory((prev) => [
          ...prev,
          {
            disks,
            moves: moves.length,
            time: totalTime,
            date: new Date().toLocaleString(),
            isAuto: true,
          },
        ]);
        clearInterval(interval);
        setIsAutoPlaying(false);
      }

      moveIndex++;
    }, 500);

    return () => clearInterval(interval);
  }, [disks, towers, autoMove, isAutoPlaying, startTime]);

  const handleTowerClick = (towerIndex) => {
    if (!gameStarted) return;

    if (selectedTower === null) {
      if (towers[towerIndex].length === 0) return;
      setSelectedTower(towerIndex);
    } else {
      if (
        towers[towerIndex].length === 0 ||
        towers[towerIndex][towers[towerIndex].length - 1] >
          towers[selectedTower][towers[selectedTower].length - 1]
      ) {
        const newTowers = [...towers];
        const disk = newTowers[selectedTower].pop();
        newTowers[towerIndex].push(disk);
        setTowers(newTowers);
        setMoves(moves + 1);

        if (towerIndex === 2 && newTowers[2].length === disks) {
          const endTimeStamp = Date.now();
          setEndTime(endTimeStamp);
          setGameStarted(false);
          const totalTime = Math.floor((endTimeStamp - startTime) / 1000);
          setHistory((prev) => [
            ...prev,
            {
              disks,
              moves: moves + 1,
              time: totalTime,
              date: new Date().toLocaleString(),
              isAuto: false,
            },
          ]);
        }
      }
      setSelectedTower(null);
    }
  };

  useEffect(() => {
    if (gameStarted && !endTime) {
      const timer = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, startTime, endTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e293b] to-[#334155] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl text-center text-[#60a5fa] font-crimson-text mb-8 drop-shadow-lg">
          汉诺塔游戏
        </h1>

        <div className="bg-[#1f2937] rounded-xl p-6 shadow-2xl mb-8 border border-[#3b82f6]/20">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <label className="text-[#60a5fa] font-roboto mr-4">层数:</label>
              <select
                value={disks}
                onChange={(e) => setDisks(parseInt(e.target.value))}
                className="w-20 px-3 py-2 bg-[#374151] text-white rounded-lg border border-[#3b82f6]/30"
                disabled={gameStarted}
              >
                {[3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={initializeTowers}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-roboto px-6 py-2 rounded-lg transition-colors"
                disabled={gameStarted}
              >
                开始游戏
              </button>
              <button
                onClick={startAutoPlay}
                className="bg-[#10b981] hover:bg-[#059669] text-white font-roboto px-6 py-2 rounded-lg transition-colors"
                disabled={!gameStarted || isAutoPlaying}
              >
                自动完成
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-[#475569] hover:bg-[#64748b] text-white font-roboto px-6 py-2 rounded-lg transition-colors"
              >
                历史记录
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="text-[#60a5fa] font-roboto">移动次数: {moves}</div>
            <div className="text-[#60a5fa] font-roboto">用时: {gameTime}秒</div>
          </div>

          {gameStarted && (
            <div className="text-center mb-6">
              <div className="text-[#60a5fa] font-roboto mb-2">
                游戏规则: 将所有圆盘按从小到大的顺序移动到最右边的柱子
              </div>
              <div className="text-[#60a5fa] font-roboto">
                {selectedTower === null ? (
                  <p>👆 点击任意柱子来选择要移动的圆盘</p>
                ) : (
                  <p>👉 选择一个目标柱子来放置圆盘</p>
                )}
              </div>
            </div>
          )}

          {showHistory ? (
            <div className="bg-[#374151] rounded-lg p-4 mb-6 max-h-[300px] overflow-auto">
              <h2 className="text-[#60a5fa] font-roboto text-xl mb-4">
                游戏历史
              </h2>
              {history.length === 0 ? (
                <p className="text-gray-400">暂无历史记录</p>
              ) : (
                <div className="space-y-2">
                  {history.map((record, index) => (
                    <div key={index} className="bg-[#1f2937] p-3 rounded-lg">
                      <p className="text-[#60a5fa]">日期: {record.date}</p>
                      <p className="text-[#60a5fa]">层数: {record.disks}</p>
                      <p className="text-[#60a5fa]">移动次数: {record.moves}</p>
                      <p className="text-[#60a5fa]">用时: {record.time}秒</p>
                      <p
                        className={`${record.isAuto ? "text-[#10b981]" : "text-[#3b82f6]"}`}
                      >
                        完成方式: {record.isAuto ? "自动完成" : "手动完成"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-around items-end h-[300px] md:h-[400px]">
              {towers.map((tower, index) => (
                <div
                  key={index}
                  onClick={() => handleTowerClick(index)}
                  className={`relative w-[100px] md:w-[150px] cursor-pointer h-full flex items-end justify-center transition-all duration-300 rounded-lg ${
                    selectedTower === index
                      ? "bg-[#374151] shadow-[0_0_30px_rgba(96,165,250,0.5)]"
                      : "hover:bg-[#374151]/30"
                  }`}
                >
                  <div className="absolute bottom-0 left-1/2 w-4 h-[200px] md:h-[300px] bg-[#64748b] transform -translate-x-1/2 rounded-t-lg" />
                  <div className="absolute bottom-0 left-1/2 w-[120px] md:w-[180px] h-4 bg-[#64748b] transform -translate-x-1/2 rounded-lg" />
                  {tower.map((disk, diskIndex) => {
                    const isTopDisk = diskIndex === tower.length - 1;
                    const isSelectedTowerTopDisk =
                      selectedTower === index && isTopDisk;
                    return (
                      <div
                        key={diskIndex}
                        className={`absolute bottom-0 transition-all duration-300`}
                        style={{
                          width: `${(disk * 80) / disks}%`,
                          height: "20px",
                          backgroundColor: `hsl(${disk * 40}, 80%, 60%)`,
                          left: "50%",
                          transform: `translateX(-50%) translateY(-${(diskIndex + 1) * 24}px)`,
                          borderRadius: "8px",
                          filter: isSelectedTowerTopDisk
                            ? "brightness(1.4) drop-shadow(0 0 15px rgba(96,165,250,0.8))"
                            : "brightness(1)",
                          boxShadow: isSelectedTowerTopDisk
                            ? "0 0 20px rgba(96,165,250,0.6)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {endTime && (
          <div className="text-center bg-[#1f2937] p-6 rounded-xl border border-[#3b82f6]/20">
            <div className="text-2xl text-[#60a5fa] font-crimson-text mb-4">
              🎉 恭喜! 你完成了游戏! 🎉
            </div>
            <div className="text-xl text-[#60a5fa] font-roboto">
              总用时: {Math.floor((endTime - startTime) / 1000)}秒<br />
              移动次数: {moves}
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(96,165,250,0.4); }
          50% { box-shadow: 0 0 35px rgba(96,165,250,0.7); }
          100% { box-shadow: 0 0 20px rgba(96,165,250,0.4); }
        }
        @keyframes diskGlow {
          0% { 
            filter: brightness(1.3) drop-shadow(0 0 12px rgba(96,165,250,0.6));
            transform: scale(1.02);
          }
          50% { 
            filter: brightness(1.5) drop-shadow(0 0 18px rgba(96,165,250,0.9));
            transform: scale(1.05);
          }
          100% { 
            filter: brightness(1.3) drop-shadow(0 0 12px rgba(96,165,250,0.6));
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

export default MainComponent