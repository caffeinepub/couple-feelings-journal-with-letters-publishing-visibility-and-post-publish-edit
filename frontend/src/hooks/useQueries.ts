import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Draft, PublishedLetter, LetterData } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetPartner() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal | null>({
    queryKey: ['partner'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartner();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPartner(partner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function useGetDraft() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Draft | null>({
    queryKey: ['draft'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDraft();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveDraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDraft(title, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft'] });
    },
  });
}

export function usePublishLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LetterData) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now());
      return actor.publishLetter(data, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft'] });
      queryClient.invalidateQueries({ queryKey: ['publicFeed'] });
      queryClient.invalidateQueries({ queryKey: ['publishedLetter'] });
      queryClient.invalidateQueries({ queryKey: ['relationshipLetters'] });
    },
  });
}

export function useUpdatePublishedLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LetterData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePublishedLetter(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicFeed'] });
      queryClient.invalidateQueries({ queryKey: ['publishedLetter'] });
      queryClient.invalidateQueries({ queryKey: ['relationshipLetters'] });
    },
  });
}

export function useGetPublicFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublishedLetter[]>({
    queryKey: ['publicFeed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPublishedLetter() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PublishedLetter | null>({
    queryKey: ['publishedLetter', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getPublishedLetter(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetRelationshipLetters() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublishedLetter[]>({
    queryKey: ['relationshipLetters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRelationshipLetters();
    },
    enabled: !!actor && !actorFetching,
  });
}
