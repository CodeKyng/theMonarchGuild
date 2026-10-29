import type { ProfileData } from "@/components/editprofile";

export default function ProfileSkills({ profile }: { profile: ProfileData }) {
  const skills = profile.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const interests = profile.interests
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const chip =
    "max-w-full break-words rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary sm:text-sm sm:px-3 sm:py-1.5";

  return (
    <div className="space-y-3">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Skills
        </h3>
        {skills.length ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill} className={chip}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Web3 interests
        </h3>
        {interests.length ? (
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <span key={interest} className={`${chip} bg-muted text-foreground`}>
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No interests added yet.</p>
        )}
      </div>
    </div>
  );
}
