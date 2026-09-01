import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TournamentItem } from '../types';
import { sendTournamentEntryPass } from '../lib/gmail';
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  DollarSign,
  Gamepad,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TournamentsView: React.FC = () => {
  const { tournaments, playUiSound, showToast } = useApp();
  const { currentUser, addXpAndPoints } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeTournamentModal, setActiveTournamentModal] = useState<TournamentItem | null>(null);
  const [joinedTournaments, setJoinedTournaments] = useState<{ [id: string]: boolean }>({});
  const [joining, setJoining] = useState(false);

  const statuses = ['All', 'LIVE', 'UPCOMING', 'COMPLETED'];

  const filteredTournaments = tournaments.filter(
    (t) => selectedStatus === 'All' || t.status.toUpperCase() === selectedStatus.toUpperCase()
  );

  const handleOpenModal = (tournament: TournamentItem) => {
    playUiSound('click');
    setActiveTournamentModal(tournament);
  };

  const handleJoinTournament = async (tournament: TournamentItem) => {
    playUiSound('claim');
    if (!currentUser) {
      showToast('Login Required', 'Please sign in to join tournaments', 'info');
      return;
    }

    setJoining(true);
    try {
      // Send Gmail tournament entry confirmation email
      await sendTournamentEntryPass({
        toEmail: currentUser.email || 'nkoffcil27@gmail.com',
        recipientName: currentUser.displayName || 'Gamer',
        tournamentTitle: tournament.title,
        gameTitle: tournament.gameTitle,
        prizePool: tournament.prizePool,
        startDate: tournament.startDate,
        teamName: `${currentUser.displayName}'s Squad`,
      });

      setJoinedTournaments((prev) => ({ ...prev, [tournament.id]: true }));
      confetti({ particleCount: 80, spread: 70 });
      addXpAndPoints(300, 100, `Registered for ${tournament.title}`);
      showToast(
        'Entry Confirmed!',
        `Official pass dispatched to ${currentUser.email || 'nkoffcil27@gmail.com'}. Earned +300 XP!`,
        'success'
      );
    } catch (err) {
      console.error('Error joining tournament:', err);
      setJoinedTournaments((prev) => ({ ...prev, [tournament.id]: true }));
      showToast('Entry Registered', `Joined ${tournament.title}!`, 'success');
    } finally {
      setJoining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'LIVE':
        return 'bg-rose-500 text-white animate-pulse';
      case 'UPCOMING':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>GLOBAL ESPORTS CIRCUIT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            ESPORTS <span className="text-amber-400">TOURNAMENTS</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Compete against the world's best squads for cash prize pools, championship trophies, and pro contracts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => {
                playUiSound('click');
                setSelectedStatus(st);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredTournaments.length} Tournaments Available
        </span>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((t) => {
          const isJoined = joinedTournaments[t.id];

          return (
            <div
              key={t.id}
              onClick={() => handleOpenModal(t)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
            >
              {/* Banner Art */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                <img
                  src={t.bannerImage}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Status Badge */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md ${getStatusBadge(
                    t.status
                  )}`}
                >
                  ● {t.status}
                </span>

                {/* Prize Tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-amber-400 font-black text-lg bg-slate-950/80 px-3 py-1 rounded-xl backdrop-blur-md border border-amber-500/30">
                  <Trophy className="w-4 h-4" />
                  <span>{t.prizePool}</span>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    {t.gameTitle} &bull; {t.format}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition line-clamp-1 mt-0.5">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    Compete for 1st place prize of {t.firstPlacePrize}. Top teams qualify for global grand finals.
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {t.participantsCount} / {t.maxParticipants} Squads
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    1st Place: <span className="text-slate-900">{t.firstPlacePrize}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isJoined) return;
                      handleJoinTournament(t);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm ${
                      isJoined
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black hover:scale-105'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5" />
                        <span>Join Tournament</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tournament Details Modal */}
      {activeTournamentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header Art */}
            <div className="relative h-60 w-full bg-slate-900 shrink-0">
              <img
                src={activeTournamentModal.bannerImage}
                alt={activeTournamentModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setActiveTournamentModal(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full transition shadow-lg z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-xs rounded uppercase">
                    {activeTournamentModal.status}
                  </span>
                  <h2 className="text-2xl font-black mt-1.5">{activeTournamentModal.title}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Game: {activeTournamentModal.gameTitle} &bull; Format: {activeTournamentModal.format}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Total Prize Pool</span>
                  <div className="text-2xl font-black text-amber-400">{activeTournamentModal.prizePool}</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-50 flex-1">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                  Tournament Overview & Schedule
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  Official tournament circuit for {activeTournamentModal.gameTitle}. 1st Place Champion takes {activeTournamentModal.firstPlacePrize}.
                </p>
              </div>

              {/* Tournament Schedule & Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" /> Event Schedule
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li>&bull; <strong className="text-slate-900">Check-in:</strong> 60 mins before start</li>
                    <li>&bull; <strong className="text-slate-900">Start Date:</strong> {activeTournamentModal.startDate}</li>
                    <li>&bull; <strong className="text-slate-900">End Date:</strong> {activeTournamentModal.endDate}</li>
                    <li>&bull; <strong className="text-slate-900">Server:</strong> NA / EU Official 120Hz Tick</li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Tournament Rules
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    {activeTournamentModal.rules.map((rule, idx) => (
                      <li key={idx}>&bull; {rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Footer inside modal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Entry Requirement</span>
                  <span className="text-sm font-bold text-slate-900">Free for CyberX Members</span>
                </div>

                <button
                  disabled={joining || joinedTournaments[activeTournamentModal.id]}
                  onClick={() => handleJoinTournament(activeTournamentModal)}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm transition flex items-center gap-2 shadow-lg ${
                    joinedTournaments[activeTournamentModal.id]
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                  }`}
                >
                  {joinedTournaments[activeTournamentModal.id] ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Registration Confirmed</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>Register Squad (Instant Pass via Gmail)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
