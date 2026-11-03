"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type RatingRow = {
  id: string | number;
  name: string | null;
  message: string | null;
  rating: number | null;
  color: string | null;
  pasted: boolean | null;
  user_id: string | null;
  created_at: string;
};

export function RatingBrowser() {
  const [selectedRating, setSelectedRating] = useState(0);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [average, setAverage] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [cards, setCards] = useState<RatingRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userHasRating, setUserHasRating] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("ratingUserId");
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("ratingUserId", id);
    }
    setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const loadRatings = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("id,name,message,rating,color,pasted,user_id,created_at")
        .eq("pasted", true)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setStatus({ type: "error", message: `Could not load ratings: ${error.message}` });
        return;
      }
      const ratings = (data ?? []) as RatingRow[];
      const rated = ratings.filter((row) => Number(row.rating) > 0);
      setCards(ratings);
      setTotalRatings(ratings.length);
      setAverage(rated.length ? rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length : null);
      setUserHasRating(ratings.some((row) => row.user_id === userId));
    };
    void loadRatings();
    return () => { active = false; };
  }, [userId]);

  const submitRating = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRating || isSubmitting || userHasRating || !userId) return;
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });
    const submittedId = Date.now().toString();
    const payload = {
      id: submittedId,
      name: name.trim(),
      message: feedback.trim(),
      rating: selectedRating,
      color: "#ef4444",
      pasted: true,
      avatar_url: null,
      user_id: userId,
    };
    const { error } = await supabase.from("ratings").upsert(payload);
    setIsSubmitting(false);
    if (error) {
      setStatus({ type: "error", message: `Your rating could not be saved: ${error.message}` });
      return;
    }
    const submittedRatings = JSON.parse(localStorage.getItem("submittedRatingIds") || "[]") as string[];
    localStorage.setItem("submittedRatingIds", JSON.stringify([...submittedRatings, submittedId]));
    setUserHasRating(true);
    setCards((current) => [{
      id: submittedId,
      name: name.trim(),
      message: feedback.trim(),
      rating: selectedRating,
      color: "#ef4444",
      pasted: true,
      user_id: userId,
      created_at: new Date().toISOString(),
    }, ...current]);
    setTotalRatings((count) => count + 1);
    setAverage((current) => current === null ? selectedRating : ((current * totalRatings) + selectedRating) / (totalRatings + 1));
    setFeedback("");
    setName("");
    setStatus({ type: "success", message: "Rating saved. Thank you." });
  };

  const deleteRating = async (card: RatingRow) => {
    if (!userId || card.user_id !== userId || deletingId !== null) return;
    setDeletingId(card.id);
    setStatus({ type: "idle", message: "" });
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("id", card.id)
      .eq("user_id", userId);
    if (error) {
      setDeletingId(null);
      setStatus({ type: "error", message: `Your rating could not be deleted: ${error.message}` });
      return;
    }

    const remainingCards = cards.filter((currentCard) => currentCard.id !== card.id);
    const remainingRatedCards = remainingCards.filter((currentCard) => Number(currentCard.rating) > 0);
    const submittedRatings = JSON.parse(localStorage.getItem("submittedRatingIds") || "[]") as string[];
    localStorage.setItem("submittedRatingIds", JSON.stringify(submittedRatings.filter((id) => id !== String(card.id))));
    setCards(remainingCards);
    setTotalRatings(remainingCards.length);
    setAverage(remainingRatedCards.length
      ? remainingRatedCards.reduce((sum, currentCard) => sum + Number(currentCard.rating), 0) / remainingRatedCards.length
      : null);
    setUserHasRating(remainingCards.some((currentCard) => currentCard.user_id === userId));
    setDeletingId(null);
    setStatus({ type: "success", message: "Your rating was deleted." });
  };

  return (
    <div className="rating-browser">
      <section className="rating-cards" aria-label="Submitted ratings">
        {cards.length === 0 ? (
          <div className="rating-empty">NO FEEDBACK CARDS YET</div>
        ) : (
          cards.map((card) => (
            <article className="rating-card" key={card.id}>
              <div className="rating-card-top">
                <strong>{card.name?.trim() || "ANONYMOUS USER"}</strong>
                <div className="rating-card-meta">
                  <time dateTime={card.created_at}>{new Date(card.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                  {card.user_id === userId && (
                    <button
                      className="rating-delete"
                      type="button"
                      onClick={() => void deleteRating(card)}
                      disabled={deletingId !== null}
                      aria-label="Delete your rating"
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
              <div className="rating-card-stars" aria-label={`${card.rating ?? 0} out of 5 stars`}>
                {"★".repeat(Math.max(0, Math.min(5, Number(card.rating) || 0)))}
                <span>{"★".repeat(5 - Math.max(0, Math.min(5, Number(card.rating) || 0)))}</span>
              </div>
              <p>{card.message?.trim() || "No written feedback provided."}              </p>
            </article>
          ))
        )}
        {isFormOpen ? (
          <form className="rating-form rating-entry-card" onSubmit={submitRating}>
          <fieldset>
            <legend>Your rating</legend>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value <= selectedRating ? "rating-star active" : "rating-star"}
                  onClick={() => setSelectedRating(value)}
                  aria-label={`${value} out of 5`}
                  aria-pressed={value === selectedRating}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <label className="rating-feedback">
            Your name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Your name..."
            />
          </label>
          <label className="rating-feedback">
            Optional feedback
            <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength={500} placeholder="Leave a short note..." />
          </label>
          <button className="rating-submit" type="submit" disabled={!selectedRating || isSubmitting || userHasRating}>
            {userHasRating ? "RATED" : isSubmitting ? "SENDING..." : "SUBMIT RATING"}
          </button>
          {status.message && <p className={`rating-status rating-status--${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p>}
          </form>
        ) : (
          <button className="rating-add-button" type="button" onClick={() => setIsFormOpen(true)} disabled={userHasRating}>
            <span aria-hidden="true">+</span> {userHasRating ? "RATED" : "RATE PORTFOLIO"}
          </button>
        )}
      </section>
    </div>
  );
}
