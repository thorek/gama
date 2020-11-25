# Securing your API 

Per default your API is public. Anyone with access to the GraphQL endpoint can request any query or mutation. 

## Principal

To controll access to the entity queries and mutations GAMA includes a default `EntityPermission` module that uses the concept of a principal with roles and probably some assigned IDs together with a permission configuration of the entities.


### Setting the principal 

Whether and how an application determines a principial object is of course specific to the actual implementation. You would probably integrate a Authentication Provider or SSO, or implement your own logic. 

### User as Principal

To demonstrate this we use a very simple approach with a _User_ entity that will hold the _roles_ and _assigned IDs_ to grant an API user access to certain queries and mutations. The API can call a _custom mutation_ with a username and passwort and if the credentials are valid will get a token it can than send along the GraphQL requests.

GAMA uses this token to get the user item from the _datastore_. This user item's _roles_ and _assigned IDs_ can be used to evaluate the actual rights for any API call. 

Let's start with a simple User entity defintion that defines a user with username/password and assigned roles. We will also add another entity `VehicleFleet` that requires some role permissions and assume a user has an `assocToMany` relationship to `VehicleFleet`.

```yaml
entity:
  VehicleFleet: 
    attributes: 
      name: Key
    seeds:
      fleetA:
        name: Fleet A
      fleetB:
        name: Fleet B
    permissions:
      manager: 
        cru: true        
      user: 
        r: true

  User:
    attributes: 
      username: Key
      password: String!
      roles: [String!]
```

We will of course not store a plaintext passwords here but use an encrypted hash value instead. Because of that we cannot add _seed data_ in the YAML configuration but add define it in a configuration object. 

```typescript
const domainConfiguration:DomainConfiguration => {
  entity: {
    User: {
      seeds: {
        admin: { 
          username: 'admin', 
            password: this.password('admin'),
            roles: ['admin'] 
          },
          manager: { 
            username: 'manager', 
            password: this.password('manager'),
            roles: ['user', 'manager']
          },
          user: { 
            username: 'user', 
            password: this.password('user'),
            roles: ['user'] 
          }
      }
    }
  });

  private password = (password:string):string => 
    bcrypt.hashSync( password, bcrypt.genSaltSync(10) );
```

See how we use the `password` method in the _seed data_. The `password` method uses the [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) library to create a secure hash of a plaintext password.

With this an initial set of user items (with hashed passwords) are available. How to register new users is not covered here, but will probably consists of another custom mutation where you implement the sign up process and assigning of roles etc.

We will now add the custom `login` mutation, that takes a username and password, loads the according user item and (if credentials match) creates a random token, assigns the user to this token and returns it to the API client. We also store the `Date` when we assigned the user to the token, so we can later apply a maximum period of validity.

```typescript
private users:{[username:string]:any} = {};

getConfiguration = ():DomainConfiguration => ({
  entity: {
    // left out
  },
  mutation: {
    login: ( runtime:Runtime ) => ({
      type: 'String',
      args: {
        username: 'String!',
        password: 'String'
      },
      resolve: (root:any, args:any) => 
        this.login( runtime, args.username, args.password ),
      description: 'returns a token if successfull, null otherwise'
    })
  }
});

private login = async (runtime:Runtime, username:string, password = "") => {
  const entity = runtime.entity('User')
  const user = await entity.findOneByAttribute( { username } );
  if( ! user ) return undefined;
  const hash = user.item.password;
  if( ! await bcrypt.compare( password, hash ) ) return undefined;
  const token = _.toString(_.random(9999999999999999999999) );
  _.set( this.users, username, { token, user, date: new Date() } );
  return token;
}
```

A client can now use the `login` mutation to get a valid token. 

```graphql
mutation {
  login( username: "admin" password: "admin" )
}
```

The client would probably store this token in a session context or similar to use it in later requests. Let's assume the clients wants to 
