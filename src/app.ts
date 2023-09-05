import { Elysia } from "elysia";
import typia, { tags } from "typia";

interface User {
  id: string & tags.Format<"uuid">;
  email: string & tags.Format<"email">;
  name: string & tags.MinLength<3> & tags.MaxLength<32>;
}

const parseUser = typia.createValidate<User>();

class State {
  users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
  }

  getUser(id: string) {
    return this.users.find((user) => user.id === id);
  }

  getUsers() {
    return this.users;
  }
}

const app = new Elysia()
  .decorate("state", new State())
  .get("/", () => "Hello Elysia")
  .get("/users", (ctx) => ctx.state.getUsers())
  .get("/users/:id", (ctx) => {
    const user = ctx.state.getUser(ctx.params.id);
    if (!user) {
      ctx.set.status = 404;
      return;
    }
    return user;
  })
  .post("/users", (ctx) => {
    const user = parseUser(ctx.body);
    if (!user.success) {
      ctx.set.status = 400;
      return;
    }
    ctx.state.addUser(user.data);
    return user.data;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
