import React from 'react';
import { motion } from 'framer-motion';
import { Cake, Heart, Flame, Users, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OccasionCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  accentBorder: string;
}

export const OccasionsSection: React.FC = () => {
  const occasions: OccasionCard[] = [
    {
      id: 'birthday',
      name: 'Birthday',
      description: 'Countdown timers, celebratory message section, photo gallery, and festive background music.',
      icon: <Cake className="h-6 w-6 text-amber-400" />,
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      accentBorder: 'group-hover:border-amber-500/40'
    },
    {
      id: 'love',
      name: 'Love',
      description: 'Poetic digital letters, romantic music track, floating heart particles, and secret passwords.',
      icon: <Heart className="h-6 w-6 text-pink-400 fill-pink-400/20" />,
      gradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-pink-500/10 border-pink-500/20',
      accentBorder: 'group-hover:border-pink-500/40'
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      description: 'Interactive timeline of your journey together, favorite photos, and cherished milestones.',
      icon: <Flame className="h-6 w-6 text-rose-400" />,
      gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      accentBorder: 'group-hover:border-rose-500/40'
    },
    {
      id: 'friendship',
      name: 'Friendship',
      description: 'Fun memories, funny inside-joke quizzes, photo slideshows, and heartfelt appreciation notes.',
      icon: <Users className="h-6 w-6 text-sky-400" />,
      gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      accentBorder: 'group-hover:border-sky-500/40'
    },
    {
      id: 'graduation',
      name: 'Graduation',
      description: 'Celebrate big achievements, future wishes, family messages, and memorable photos.',
      icon: <GraduationCap className="h-6 w-6 text-emerald-400" />,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      accentBorder: 'group-hover:border-emerald-500/40'
    },
    {
      id: 'just-because',
      name: 'Just Because',
      description: 'Unexpected surprise notes, thinking-of-you cards, and sweet gestures to make someone smile.',
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      accentBorder: 'group-hover:border-purple-500/40'
    }
  ];

  return (
    <section id="occasions" className="relative py-20 md:py-32 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold tracking-widest text-pink-400 uppercase bg-pink-500/10 px-3.5 py-1.5 rounded-full border border-pink-500/20">
            For Every Special Moment
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mt-4 mb-4">
            Designed for Life’s Greatest Occasions
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Whether celebrating years together or sending a spontaneous message, pick a theme and craft your digital gift.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            >
              <Link
                to={`/create?occasion=${item.id}`}
                className={`group relative flex flex-col justify-between rounded-3xl border border-pink-500/20 bg-slate-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/10 ${item.accentBorder}`}
              >
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10`} />

                <div>
                  {/* Icon */}
                  <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center mb-6 shadow-inner ${item.iconBg}`}>
                    {item.icon}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-2xl font-bold text-white mb-2 group-hover:text-pink-200 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="flex items-center text-xs font-semibold text-pink-400 gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                  <span>Create {item.name} Experience</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
