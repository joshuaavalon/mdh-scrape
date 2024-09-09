type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
type AllowBuild<Source, Product> = RequiredKeys<Source> extends never ? Product : never;

export interface TypeSafeBuilder<Source, Product> {
  with<T extends keyof Source>(key: T, value: Source[T]): TypeSafeBuilder<Omit<Source, T>, Product>;
  build(): AllowBuild<Source, Product>;
}

class TypeBuilder {

}
