import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import ConversationSidebar from "@/components/member/messages/ConversationSidebar";
import MessagesHeader from "@/components/member/messages/MessagesHeader";
import MessageThread from "@/components/member/messages/MessageThread";
import type { DirectMessage, MemberContact, MemberConversation } from "@/components/member/messages/types";
import MemberProfileDialog from "@/components/member/explore-members/MemberProfileDialog";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import { db } from "@/firebase";

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function asSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean);
  }
  return typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function conversationFromDoc(id: string, data: Record<string, unknown>): MemberConversation {
  const rawNames =
    data.participantNames && typeof data.participantNames === "object"
      ? (data.participantNames as Record<string, unknown>)
      : {};
  return {
    id,
    participants: Array.isArray(data.participants)
      ? data.participants.filter((value): value is string => typeof value === "string")
      : [],
    participantNames: Object.fromEntries(Object.entries(rawNames).map(([key, value]) => [key, asText(value)])),
    lastMessage: asText(data.lastMessage),
    lastMessageAt: asDate(data.lastMessageAt),
    lastMessageId: asText(data.lastMessageId),
    updatedAt: asDate(data.updatedAt),
  };
}

function minimalProfile(id: string, displayName: string): PublicMemberProfile {
  return {
    id,
    displayName: displayName || "Guild member",
    professionalTitle: "",
    workType: "",
    experienceYears: "",
    skills: [],
    location: "",
    bio: "",
    interests: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
  };
}

export default function MemberMessages() {
  const { user, role } = useAuth();
  const basePath = role ? `/${role}` : "/member";

  const [conversations, setConversations] = useState<MemberConversation[]>([]);
  const [contacts, setContacts] = useState<MemberContact[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeConversation, setActiveConversation] = useState<MemberConversation | null>(null);
  const [ownName, setOwnName] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [profileMember, setProfileMember] = useState<PublicMemberProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (active) setOwnName(asText(snapshot.data()?.displayName) || user.displayName || "");
      })
      .catch((loadError) => {
        console.error("Failed to load messaging profile:", loadError);
        if (active) setError("Your profile could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [user, retryToken]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "conversations"), where("participants", "array-contains", user.uid)),
      (snapshot) => {
        const rows = snapshot.docs.map((entry) => conversationFromDoc(entry.id, entry.data()));
        rows.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        setConversations(rows);
        const requestedConversation = new URLSearchParams(window.location.search).get("conversation");
        const requested = requestedConversation
          ? rows.find((conversation) => conversation.id === requestedConversation)
          : undefined;
        if (requested && requested.id !== selectedId) {
          setSelectedId(requested.id);
          setActiveConversation(requested);
          setMessages([]);
          setLoadingMessages(true);
        }
        setLoadingConversations(false);
        setError("");
      },
      (loadError) => {
        console.error("Failed to load conversations:", loadError);
        setError("Your conversations could not be loaded. Check your connection and access, then try again.");
        setLoadingConversations(false);
      },
    );
  }, [user, retryToken, selectedId]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "publicProfiles"),
      (snapshot) => {
        setContacts(
          snapshot.docs
            .map((entry) => ({
              id: entry.id,
              displayName: asText(entry.data().displayName),
              professionalTitle: asText(entry.data().professionalTitle),
            }))
            .filter((contact) => contact.id !== user.uid && contact.displayName.trim())
            .sort((a, b) => a.displayName.localeCompare(b.displayName)),
        );
      },
      (loadError) => {
        console.error("Failed to load messaging contacts:", loadError);
        setError("Discoverable members could not be loaded. Try again shortly.");
      },
    );
  }, [user, retryToken]);

  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedId) ??
      (activeConversation?.id === selectedId ? activeConversation : null),
    [activeConversation, conversations, selectedId],
  );

  useEffect(() => {
    if (!user || !selectedId) return;
    return onSnapshot(
      query(collection(db, "conversations", selectedId, "messages"), orderBy("createdAt", "asc")),
      (snapshot) => {
        setMessages(
          snapshot.docs.map((entry) => {
            const data = entry.data();
            return {
              id: entry.id,
              senderId: asText(data.senderId),
              body: asText(data.body),
              createdAt: asDate(data.createdAt),
            } satisfies DirectMessage;
          }),
        );
        setLoadingMessages(false);
      },
      (loadError) => {
        console.error("Failed to load conversation messages:", loadError);
        setError("Messages in this conversation could not be loaded.");
        setLoadingMessages(false);
      },
    );
  }, [selectedId, user, retryToken]);

  function selectConversation(conversation: MemberConversation) {
    setMessages([]);
    setLoadingMessages(true);
    setDraft("");
    setSelectedId(conversation.id);
    setActiveConversation(conversation);
    setError("");
  }

  async function startConversation(contact: MemberContact) {
    if (!user || !ownName) {
      setError("Complete your Guild profile before starting a conversation.");
      return;
    }
    setStarting(true);
    setError("");
    const participants = [user.uid, contact.id].sort();
    const conversationId = participants.join("__");
    const conversationRef = doc(db, "conversations", conversationId);
    try {
      const existing = conversations.find((conversation) => conversation.id === conversationId);
      if (!existing) {
        const conversation: MemberConversation = {
          id: conversationId,
          participants,
          participantNames: { [user.uid]: ownName, [contact.id]: contact.displayName },
          lastMessage: "",
          lastMessageAt: null,
          lastMessageId: "",
          updatedAt: new Date(),
        };
        await setDoc(conversationRef, {
          participants,
          participantNames: conversation.participantNames,
          lastMessage: "",
          lastMessageAt: null,
          lastMessageId: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setActiveConversation(conversation);
      } else {
        setActiveConversation(existing);
      }
      setMessages([]);
      setLoadingMessages(true);
      setDraft("");
      setSelectedId(conversationId);
    } catch (startError) {
      console.error("Failed to start conversation:", startError);
      setError(
        "A conversation could not be started. Make sure this member is still discoverable and try again.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!user || !selectedConversation || !body || sending || body.length > 2000) return;
    setSending(true);
    setError("");
    const conversationRef = doc(db, "conversations", selectedConversation.id);
    const messageRef = doc(collection(conversationRef, "messages"));
    const batch = writeBatch(db);
    batch.set(messageRef, { senderId: user.uid, body, createdAt: serverTimestamp() });
    batch.update(conversationRef, {
      lastMessage: body,
      lastMessageAt: serverTimestamp(),
      lastMessageId: messageRef.id,
      updatedAt: serverTimestamp(),
    });
    const recipientId = selectedConversation.participants.find((participantId) => participantId !== user.uid);
    if (recipientId) {
      const notificationRef = doc(collection(db, "users", recipientId, "notifications"));
      batch.set(notificationRef, {
        type: "message",
        title: "New message",
        body: `${ownName || "A Guild member"} sent you a message.`,
        href: `${basePath}/messages?conversation=${encodeURIComponent(selectedConversation.id)}`,
        actorName: ownName || "A Guild member",
        sourceId: selectedConversation.id,
        sourceMessageId: messageRef.id,
        createdAt: serverTimestamp(),
        readAt: null,
      });
    }
    try {
      await batch.commit();
      setDraft("");
    } catch (sendError) {
      console.error("Failed to send direct message:", sendError);
      setError("Your message could not be sent. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function openParticipantProfile(participantId: string, displayName: string) {
    if (!participantId) {
      setProfileMember(minimalProfile("", displayName));
      return;
    }
    try {
      const snap = await getDoc(doc(db, "publicProfiles", participantId));
      if (snap.exists()) {
        const data = snap.data();
        setProfileMember({
          id: participantId,
          displayName: asText(data.displayName) || displayName || "Guild member",
          professionalTitle: asText(data.professionalTitle),
          workType: asText(data.workType),
          experienceYears: asText(data.experienceYears),
          skills: asSkills(data.skills),
          location: asText(data.location),
          bio: asText(data.bio),
          interests: asText(data.interests),
          websiteUrl: asText(data.websiteUrl),
          linkedinUrl: asText(data.linkedinUrl),
          githubUrl: asText(data.githubUrl),
          twitterUrl: asText(data.twitterUrl),
        });
      } else {
        setProfileMember(minimalProfile(participantId, displayName));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfileMember(minimalProfile(participantId, displayName));
    }
  }

  const retry = () => {
    setError("");
    setLoadingConversations(true);
    setLoadingMessages(Boolean(selectedId));
    setRetryToken((value) => value + 1);
  };

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-7xl flex-col space-y-6">
      <MessagesHeader />
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-5 text-destructive">{error}</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reconnect
          </button>
        </div>
      )}
      <section className="grid h-[min(70vh,40rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[19rem_minmax(0,1fr)]">
        <div className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-col`}>
          <ConversationSidebar
            conversations={conversations}
            contacts={contacts}
            currentUserId={user?.uid ?? ""}
            selectedId={selectedId}
            onSelectConversation={selectConversation}
            onStartConversation={(contact) => void startConversation(contact)}
          />
          {starting && (
            <p className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" />
              Opening conversation…
            </p>
          )}
          {loadingConversations && <span className="sr-only">Loading conversations</span>}
        </div>
        <div className={`${selectedId ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}>
          <MessageThread
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user?.uid ?? ""}
            loading={loadingMessages}
            sending={sending}
            draft={draft}
            onDraft={setDraft}
            onSend={() => void sendMessage()}
            onBack={() => {
              setSelectedId("");
              setActiveConversation(null);
            }}
            onOpenParticipant={(participantId, displayName) =>
              void openParticipantProfile(participantId, displayName)
            }
          />
        </div>
      </section>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Only conversation participants can read or send messages in their thread. Start new conversations
        with members who opt in to Explore Members.
      </p>
      <MemberProfileDialog member={profileMember} onClose={() => setProfileMember(null)} />
    </main>
  );
}
