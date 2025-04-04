import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, Subjects } from '@casl/prisma';
import { Post, Roles, User } from '@prisma/client';

export type PermActions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type PermissionResource = Subjects<{ User: User; Post: Post }> | 'all';

export type AppAbility = PureAbility<[PermActions, PermissionResource]>;

export type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

const rolePermissionsMap: Record<Roles, DefinePermissions> = {
  ADMIN(user, { can }) {
    can('manage', 'all');
  },

  EDITOR(user, { can }) {
    can('create', 'Post');
    can('read', 'Post');
    can('update', 'Post');
  },

  WRITER(user, { can }) {
    can('read', 'Post');
  },

  READER(user, { can }) {
    can('read', 'Post');
  },
};

@Injectable()
export class CaslAbilityService {
  ability: AppAbility;

  createForUser(user: User) {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    rolePermissionsMap[user.role](user, builder);
    this.ability = builder.build();
    return this.ability;
  }
}
