local claims = std.extVar('claims');
local session = std.extVar('session');

{
  claims: claims {
    role: "authenticated",
    aud: session.identity.metadata_public.orgs
  }
}
