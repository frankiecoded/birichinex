import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  GraduationCap, Play, CheckCircle, Clock, Star, Award,
  ChevronRight, ChevronLeft, BookOpen, Zap, Target, Circle
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { COURSES } from "../data/platform";
import { Course } from "../types";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import MagneticButton from "../components/three/MagneticButton";
import { useStore } from "../store/useStore";

export default function LearningPage() {
  const courseProgress = useStore((s) => s.courseProgress);
  const startCourse = useStore((s) => s.startCourse);
  const completeLesson = useStore((s) => s.completeLesson);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredCourses = filter === "all"
    ? COURSES
    : COURSES.filter((c) => c.difficulty === filter);

  const stats = useMemo(() => {
    const totalCourses = COURSES.length;
    const startedCount = Object.values(courseProgress).filter((p) => p.started).length;
    const completedCount = Object.values(courseProgress).filter((p) => p.completed).length;
    const totalLessonsCompleted = Object.values(courseProgress).reduce(
      (sum, p) => sum + p.completedLessons.length,
      0,
    );
    return { totalCourses, startedCount, completedCount, totalLessonsCompleted };
  }, [courseProgress]);

  const activeCourse = selectedCourse
    ? { course: selectedCourse, progress: courseProgress[selectedCourse.id] }
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-headline text-gradient-brand tracking-tight">Learning Academy</h1>
        <p className="text-callout text-ink-tertiary mt-1">
          Business education, certifications, and leadership development. Build once, learn everywhere.
        </p>
      </motion.div>

      {activeCourse ? (
        <CourseDetailView
          course={activeCourse.course}
          progress={activeCourse.progress}
          onBack={() => setSelectedCourse(null)}
          onStart={() => startCourse(activeCourse.course.id)}
          onCompleteLesson={(lessonId) => completeLesson(activeCourse.course.id, lessonId)}
        />
      ) : (
        <>
          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Courses", value: String(stats.totalCourses), icon: BookOpen, color: "#0A84FF" },
              { label: "Completed", value: String(stats.completedCount), icon: CheckCircle, color: "#30D158" },
              { label: "Started", value: String(stats.startedCount), icon: Play, color: "#FF9500" },
              { label: "Lessons Done", value: String(stats.totalLessonsCompleted), icon: Award, color: "#AF52DE" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard padding="md" hover>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${stat.color}12` }}>
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-title font-bold text-ink tracking-tight">{stat.value}</p>
                      <p className="text-caption text-ink-tertiary">{stat.label}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Difficulty Filter */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-2"
          >
            {["all", "beginner", "intermediate", "advanced"].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilter(diff)}
                className={`px-4 h-9 rounded-full text-subhead font-semibold transition-all duration-200 capitalize ${
                  filter === diff
                    ? "bg-emphasis text-on-emphasis"
                    : "bg-surface/72 text-ink-secondary hover:bg-surface-secondary/80 border border-glass-border"
                }`}
              >
                {diff}
              </button>
            ))}
          </motion.div>

          {/* Courses Grid */}
          <CursorSpotlight spotlightSize={500} spotlightColor="rgba(212,175,55,0.04)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course, i) => {
                const progress = courseProgress[course.id];
                const completedCount = progress?.completedLessons.length ?? 0;
                const totalLessons = course.lessons.length;
                const pct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
                const status: "not-started" | "started" | "completed" = progress?.completed
                  ? "completed"
                  : progress?.started
                    ? "started"
                    : "not-started";

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TiltCard>
                      <GlassCard padding="none" hover className="overflow-hidden h-full flex flex-col">
                        {/* Course Header */}
                        <div className="h-32 bg-gradient-to-br from-ink to-ink/80 p-6 flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] blur-[30px] pointer-events-none" />
                          <div className="absolute inset-0 opacity-[0.06]" style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                            backgroundSize: "24px 24px"
                          }} />
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 h-32 w-32 rounded-full border border-white/20" />
                            <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full border border-white/10" />
                          </div>
                          <div className="relative z-10 flex items-start justify-between">
                            <Badge variant={course.difficulty === "beginner" ? "success" : course.difficulty === "intermediate" ? "warning" : "error"} size="md">
                              {course.difficulty}
                            </Badge>
                            <Badge variant="brand" size="sm">{course.tier}</Badge>
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-title font-bold text-white tracking-tight">{course.title}</h3>
                          </div>
                        </div>

                        {/* Course Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <p className="text-callout text-ink-secondary mb-4 flex-1">{course.description}</p>

                          {/* Progress bar */}
                          {(status === "started" || status === "completed") && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-caption font-semibold text-ink">{completedCount}/{totalLessons} lessons</span>
                                <span className="text-caption font-semibold text-ink">{Math.round(pct)}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-surface-secondary/80 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${pct}%`, background: status === "completed" ? "#30D158" : "#0A84FF" }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-caption text-ink-tertiary mb-4">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.5} />{course.duration}</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" strokeWidth={1.5} />{course.lessons.length} lessons</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} />
                              <span className="text-caption font-semibold text-ink">{course.completionReward}</span>
                              {status === "completed" && (
                                <Badge variant="success" size="sm">Completed</Badge>
                              )}
                            </div>
                            <MagneticButton strength={0.2}>
                              <Button
                                variant={status === "started" ? "primary" : "primary"}
                                size="sm"
                                icon={status === "started" ? <Target className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                onClick={() => {
                                  if (!progress?.started) startCourse(course.id);
                                  setSelectedCourse(course);
                                }}
                              >
                                {status === "completed" ? "Review" : status === "started" ? "Continue" : "Start"}
                              </Button>
                            </MagneticButton>
                          </div>
                        </div>
                      </GlassCard>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </CursorSpotlight>
        </>
      )}
    </div>
  );
}

function CourseDetailView({
  course,
  progress,
  onBack,
  onStart,
  onCompleteLesson,
}: {
  course: Course;
  progress: { started: boolean; completedLessons: string[]; completed: boolean; startedAt: string };
  onBack: () => void;
  onStart: () => void;
  onCompleteLesson: (lessonId: string) => void;
}) {
  const completedCount = progress.completedLessons.length;
  const totalLessons = course.lessons.length;
  const pct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-subhead font-semibold text-ink-secondary hover:text-ink transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Courses
      </button>

      {/* Course Hero */}
      <div className="bg-gradient-to-br from-ink to-ink/80 rounded-[20px] p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] blur-[30px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={course.difficulty === "beginner" ? "success" : course.difficulty === "intermediate" ? "warning" : "error"} size="md">
              {course.difficulty}
            </Badge>
            <Badge variant="brand" size="sm">{course.tier}</Badge>
            {progress.completed && <Badge variant="success" size="sm">Completed</Badge>}
          </div>
          <h2 className="text-headline font-bold text-white mb-2">{course.title}</h2>
          <p className="text-callout text-white/70">{course.description}</p>
          <div className="flex items-center gap-4 mt-4 text-caption text-white/60">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{totalLessons} lessons</span>
            <span className="flex items-center gap-1"><Award className="h-3 w-3" />{course.completionReward}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <GlassCard padding="lg" className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-subhead font-bold text-ink">Progress</p>
          <span className="text-subhead font-bold text-ink">{completedCount}/{totalLessons} · {Math.round(pct)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-secondary/80 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: progress.completed ? "#30D158" : "#0A84FF" }}
          />
        </div>
      </GlassCard>

      {/* Lessons */}
      <div className="space-y-3">
        <p className="text-title font-bold text-ink">Lessons</p>
        {course.lessons.map((lesson, i) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <GlassCard
                padding="md"
                className={`flex items-center gap-4 ${isCompleted ? "ring-1 ring-success/20" : ""}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted ? "bg-success/10" : "bg-surface-secondary/80"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <span className="text-subhead font-bold text-ink-secondary">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-subhead font-semibold ${isCompleted ? "text-ink-tertiary line-through" : "text-ink"}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-caption text-ink-tertiary flex items-center gap-1">
                      <Clock className="h-3 w-3" />{lesson.duration}
                    </span>
                    <Badge variant="default" size="sm">{lesson.type}</Badge>
                  </div>
                </div>
                {!isCompleted && (
                  <MagneticButton strength={0.2}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle className="h-3.5 w-3.5" />}
                      onClick={() => onCompleteLesson(lesson.id)}
                    >
                      Complete
                    </Button>
                  </MagneticButton>
                )}
                {isCompleted && (
                  <Badge variant="success" size="sm">Done</Badge>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
